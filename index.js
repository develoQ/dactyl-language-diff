#! /usr/bin/env node

const { promises: fs } = require('fs');
const { execSync } = require("child_process");

const path = require('path');

const findFiles = async (directory, endwith) => {
  const markdownFiles = [];

  const searchDirectory = async (currentDir) => {
    const files = await fs.readdir(currentDir);
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await searchDirectory(filePath);
      } else if (file.endsWith(endwith)) {
        markdownFiles.push(filePath);
      }
    }
  }

  await searchDirectory(directory);

  return markdownFiles;
}

const main = async () => {
  const targets_en = (await findFiles('content', '.md')).filter((file) => !file.endsWith('.ja.md'))
  console.log("Status |  JA            | EN             | File")
  console.log("-------|----------------|----------------|---------------------------------------")
  targets_en.forEach(target_en => {
    const target_ja = target_en.replace('.md', '.ja.md')
    const date_ja = execSync(`git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%ad" -- ${target_ja}`, { encoding: 'UTF-8' }).trim().padEnd(16, ' ')
    const date_en = execSync(`git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%ad" -- ${target_en}`, { encoding: 'UTF-8' }).trim().padEnd(16, ' ')
    const status = (date_ja[0] === ' ' ? 'none' : new Date(date_ja).getTime() >= new Date(date_en).getTime() ? 'latest' : 'old').padEnd(7, ' ')
    const result = `${status} ${date_ja} ${date_en} ${target_ja}`.replaceAll('\n', '')
    console.log(result)
  });
}

main()
