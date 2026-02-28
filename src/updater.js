import {version} from '../package.json';

async function fetchLatestVersion() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/koukyoukoku/ambasplit/main/version.json");
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch version:', error);
    throw error;
  }
}

export async function checkForUpdates() {
  try {
    const latest = await fetchLatestVersion();
    // Pastikan versionData memiliki properti version
    if (latest.version !== version) {
      return latest;
    }
    return null;
  } catch (error) {
    console.error('Check updates failed:', error);
    throw error;
  }
}