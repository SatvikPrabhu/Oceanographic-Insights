const { Readable } = require("stream");
const csv = require("csv-parser");

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(buffer)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function cell(row, ...keys) {
  const lookup = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value])
  );

  for (const key of keys) {
    const value = lookup[key.toLowerCase()];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return undefined;
}

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return parsed;
}

function splitList(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(/[;|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  parseCsvBuffer,
  cell,
  parseDate,
  splitList,
};
