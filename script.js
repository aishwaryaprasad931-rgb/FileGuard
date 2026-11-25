
const singleFile = document.getElementById("singleFile");
const generateBtn = document.getElementById("generateBtn");
const hashResult = document.getElementById("hashResult");
const hashValue = document.getElementById("hashValue");

let generatedHash = "";
let selectedFileName = "";

// Generate SHA-256 hash
async function calculateHash(file) {
    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Display selected filename
singleFile.addEventListener("change", () => {
    const file = singleFile.files[0];

    document.getElementById("singleFileName").textContent =
        file ? "Selected: " + file.name : "";

    hashResult.classList.add("hidden");
    generatedHash = "";
});

// Generate hash button
generateBtn.addEventListener("click", async () => {
    const file = singleFile.files[0];

    if (!file) {
        alert("Please select a file first!");
        return;
    }

    try {
        generateBtn.disabled = true;
        generateBtn.textContent = "Generating...";

        generatedHash = await calculateHash(file);
        selectedFileName = file.name;

        hashValue.textContent = generatedHash;
        hashResult.classList.remove("hidden");

    } catch (error) {
        alert("Unable to generate hash. Please try again.");
        console.error(error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate SHA-256 Hash";
    }
});

// Copy hash
document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!generatedHash) return;

    try {
        await navigator.clipboard.writeText(generatedHash);
        alert("Hash copied successfully!");
    } catch (error) {
        alert("Clipboard access failed. Please copy the hash manually.");
    }
});

// Download report
document.getElementById("downloadBtn").addEventListener("click", () => {
    if (!generatedHash) return;

    const report = `
FILEGUARD - FILE INTEGRITY REPORT
---------------------------------
File Name: ${selectedFileName}
Algorithm: SHA-256
Generated Hash: ${generatedHash}
Date: ${new Date().toLocaleString()}

This hash can be used to verify file integrity.
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "FileGuard_Report.txt";
    link.click();

    URL.revokeObjectURL(url);
});

// Compare two files
document.getElementById("compareBtn").addEventListener("click", async () => {
    const file1 = document.getElementById("fileOne").files[0];
    const file2 = document.getElementById("fileTwo").files[0];

    const result = document.getElementById("compareResult");
    const button = document.getElementById("compareBtn");

    if (!file1 || !file2) {
        alert("Please select both files!");
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Comparing...";

        const hash1 = await calculateHash(file1);
        const hash2 = await calculateHash(file2);

        result.classList.remove("hidden");

        if (hash1 === hash2) {
            result.style.background = "#f0fdf4";
            result.style.borderColor = "#bbf7d0";

            result.innerHTML = `
                <h3>✅ Files are Identical!</h3>
                <p>Both files have the same SHA-256 hash.</p>
            `;
        } else {
            result.style.background = "#fef2f2";
            result.style.borderColor = "#fecaca";

            result.innerHTML = `
                <h3 style="color:#b91c1c">
                    ⚠️ Files are Different!
                </h3>
                <p>The SHA-256 hashes do not match.</p>
            `;
        }

    } catch (error) {
        alert("Comparison failed. Please try again.");
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = "Compare Files";
    }
});
