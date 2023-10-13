import axios from "axios";
import { Buffer } from "buffer";

/**
 * Fetches the list of filenames that have been changed in a given pull request.
 *
 * @param {string} owner - The owner of the GitHub repository.
 * @param {string} repo - The name of the GitHub repository.
 * @param {number} prNumber - The pull request number.
 * @param {string} githubToken - The GitHub API token.
 * @returns {Promise<string[]|null>} - A promise resolving to an array of filenames or null in case of error.
 */
async function fetchChangedFilesInPR(owner, repo, prNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
  const headers = { Authorization: `token ${githubToken}` };

  try {
    const { data } = await axios.get(url, { headers });
    return data;
  } catch (err) {
    console.error('Error fetching changed files:', err);
    return null;
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
    console.error('Error fetching JSON file content:', err);
    return null;
  }
}


/**
 * Merges a given pull request.
 *
 * @param {string} owner - The owner of the GitHub repository.
 * @param {string} repo - The name of the GitHub repository.
 * @param {number} prNumber - The pull request number.
 * @param {string} githubToken - The GitHub API token.
 * @returns {Promise<void>} - A promise indicating the completion of the operation.
 */
async function mergePullRequest(owner, repo, prNumber, githubToken) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/merge`;
  const headers = { Authorization: `token ${githubToken}` };
  
  try {
    const { data } = await axios.put(url, {}, { headers });
    console.log('Successfully merged:', data);
  } catch (err) {
    console.error('Error merging PR:', err);
  }
}

/**
 * Processes a pull request to determine if it should be automatically merged.
 * Criteria for merging include having only one changed file that is a JSON file
 * with specific properties.
 *
 * @param {string} owner - The owner of the GitHub repository.
 * @param {string} repo - The name of the GitHub repository.
 * @param {number} prNumber - The pull request number.
 * @param {string} githubToken - The GitHub API token.
 * @returns {Promise<void>} - A promise indicating the completion of the operation.
 */
async function processPullRequest(owner, repo, prNumber, githubToken) {
  const changedFiles = await fetchChangedFilesInPR(owner, repo, prNumber, githubToken);

  if (!changedFiles) {
    return;
  }
  const changedFilenames = changedFiles.map(file => file.filename);
  
  console.log('Changed files:', changedFilenames);

  if (changedFilenames.length === 1 && changedFilenames[0].endsWith('.json')) {
    console.log('A single JSON file has been modified.');
    const fileContent = await fetchJSONFileContent(owner, repo, changedFiles[0].sha, githubToken);

    if (!fileContent) {
      return;
    }

    if (fileContent?.info.application_lifecycle?.state === "Confirmed" &&
        fileContent?.info.application_lifecycle?.first_allocation_time !== "") {
      console.log("Conditions met for automatic merge.");
      await mergePullRequest(owner, repo, prNumber, githubToken);
    } else {
      console.log("Conditions not met for automatic merge.");
    }
  } else {
    console.log('Either multiple files are modified or the modified file is not a JSON.');
  }
}

const owner = process.env.OWNER;
const repo = process.env.REPO;
const prNumber = process.env.PR_NUMBER;
const githubToken = process.env.GITHUB_TOKEN;

processPullRequest(owner, repo, prNumber, githubToken);
