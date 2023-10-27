/**
 * Flow Validator Script
 * 
 * Use Cases:
 * - When an application is in "submitted state"
 *  · application.info.application_lifecycle.validated_by must be empty
 *  · application.info.application_lifecycle.validated_at must be empty
 *  · application.info.application_lifecycle.current_allocation_id must be empty
 *  · application.info.datacap_allocations array must be empty
 * - When an aplication is in some other state
 *  · actor must be filplus-github-bot-read-write
 */

import axios from "axios";

const FILPLUS_BOT="filplus-github-bot-read-write";

/**
 * This is the main function that will be executed by the workflow and it will validate the application flow
 * 
 * @param {string} owner 
 * @param {string} repo 
 * @param {number} prNumber 
 * @param {string} githubToken 
 * @returns 
 */
async function processPullRequest(owner, repo, prNumber, githubToken) {
  const prDetails = await fetchPRDetails(owner, repo, prNumber, githubToken);

  if (!prDetails || !prDetails.changedFiles || !prDetails.lastCommitAuthor) {
    throw new Error('Error fetching PR details.');
  }
  const changedFilenames = prDetails.changedFiles.map(file => file.filename);
  
  console.log('List of files changed in PR:', changedFilenames);
  console.log('Author of the last commit:', prDetails.lastCommitAuthor);


  if (changedFilenames.length > 1 || !changedFilenames[0].endsWith('.json')) {
    throw new Error('Either multiple files are modified or the modified file is not a JSON.');
  }

  const application = await fetchJSONFileContent(owner, repo, prDetails.changedFiles[0].sha, githubToken);

  if (!application) {
    throw new Error('Error fetching file content.');
  }

  application?.info?.application_lifecycle.state == 'Submitted' 
    ? await validateSubmittedState(application)
    : await validateOtherState(prDetails.lastCommitAuthor);

}

/**
* Fetches the list of filenames that have been changed and the author of the last commit
* in a given pull request.
*
* @param {string} owner - The owner of the GitHub repository.
* @param {string} repo - The name of the GitHub repository.
* @param {number} prNumber - The pull request number.
* @param {string} githubToken - The GitHub API token.
* @returns {Promise<Object|null>} - A promise resolving to an object containing the changed filenames
*                                   and the author of the last commit, or null in case of error.
*/
async function fetchPRDetails(owner, repo, prNumber, githubToken) {
 const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
 const headers = { Authorization: `token ${githubToken}` };

 try {
   const { data } = await axios.get(url, { headers });
   const lastCommitAuthor = data.head.user.login;
   const filesUrl = data._links.self.href + '/files';
   const filesResponse = await axios.get(filesUrl, { headers });
   const changedFiles = filesResponse.data;
   return { lastCommitAuthor, changedFiles };
 } catch (err) {
  throw new Error('Error fetching PR details:', err);
 }
}

/**
 * Fetches the content of a JSON file based on its SHA.
 *
 * @param {string} owner - The owner of the GitHub repository.
 * @param {string} repo - The name of the GitHub repository.
 * @param {string} sha - The SHA of the file.
 * @param {string} githubToken - The GitHub API token.
 * @returns {Promise<Object|null>} - A promise resolving to the parsed JSON content or null in case of error.
 */
async function fetchJSONFileContent(owner, repo, sha, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
  const headers = { Authorization: `token ${githubToken}` };

  try {
    const { data } = await axios.get(url, { headers });
    const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    throw new Error('Error fetching JSON file content:', err);
  }
}

/**
 * This function validates an application in a "Submitted" state
 * 
 * @param {Application} application - The application to validate
 * @returns Boolean - True if the application is valid, false otherwise
 */
async function validateSubmittedState(application) {
  if(application?.info?.application_lifecycle?.validated_by) {
    throw new Error('Application is already validated');
  }

  if(application?.info?.application_lifecycle?.validated_at) {
    throw new Error('Application is already validated');
  }

  if(application?.info?.application_lifecycle?.current_allocation_id) {
    throw new Error('Application has an allocation assigned');
  }

  if(application?.info?.datacap_allocations?.length > 0) {
    throw new Error('Application has an allocation assigned');
  }

  console.log('Application is in a "Submitted" state and is valid');
}

/**
 * This function validates an application in a state different than "Submitted"
 * 
 * @param {Application} application 
 * @returns Boolean - True if the application is valid, false otherwise
 */
async function validateOtherState(lastCommitAuthor) {
  if (lastCommitAuthor !== FILPLUS_BOT) {
    throw new Error(`Invalid author. Expected ${FILPLUS_BOT}, got ${lastCommitAuthor}`);
  }

  console.log('Application is in a state different than "Submitted" and is valid');
}

const owner = process.env.OWNER;
const repo = process.env.REPO;
const prNumber = process.env.PR_NUMBER;
const githubToken = process.env.GITHUB_TOKEN;

(async function run() {
  try {
    await processPullRequest(owner, repo, prNumber, githubToken);
    console.log('Flow validation completed successfully.')
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();