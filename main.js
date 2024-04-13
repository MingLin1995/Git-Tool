window.onload = () => {
    const commitType = document.getElementById("commit-type");
    const titleInput = document.getElementById("title");
    const bodyTextarea = document.getElementById("body");
    const resolvesInput = document.getElementById("resolves");
    const seeAlsoInput = document.getElementById("seeAlso");
    const generateButton = document.getElementById("generate");
    const commitMessagePre = document.getElementById("commit-message");
    const copyButton = document.getElementById("copy");
    commitType.addEventListener("change", () => {
        switch (commitType.value) {
            // 可以新增不同預設格式
            case "feat":
                bodyTextarea.value = "- 因應需求新增或調整：\n- 新增或調整項目：";
                break;
            case "fix":
                bodyTextarea.value = "- 問題：\n    - 原因：\n    - 解決方式：";
                break;
            default:
                bodyTextarea.value = "";
        }
    });
    // 產生語法
    generateButton.addEventListener("click", () => {
        const commitTypeValue = commitType.value;
        const title = titleInput.value.trim();
        const body = bodyTextarea.value.trim();
        const resolves = resolvesInput.value.trim();
        const seeAlso = seeAlsoInput.value.trim();
        const footerLines = [];
        if (resolves.startsWith("Resolves: #") &&
            resolves.length > "Resolves: #".length) {
            footerLines.push(resolves);
        }
        if (seeAlso.startsWith("See also: #") &&
            seeAlso.length > "See also: #".length) {
            footerLines.push(seeAlso);
        }
        const footer = footerLines.join("\n");
        commitMessagePre.textContent = generateCommitMessage(commitTypeValue, title, body, footer);
    });
    // 複製
    copyButton.addEventListener("click", () => {
        const commitMessage = commitMessagePre.textContent || "";
        navigator.clipboard
            .writeText(commitMessage)
            .then(() => {
            const notification = document.getElementById("copy-notification");
            if (notification) {
                notification.style.display = "block";
                setTimeout(() => {
                    notification.style.display = "none";
                }, 3000);
            }
        })
            .catch((err) => {
            console.error("Could not copy text: ", err);
        });
    });
};
function generateCommitMessage(type, subject, body, footer) {
    const header = `${type}：${subject}`;
    const bodySection = body ? `\n\n${body}` : "";
    const footerSection = footer ? `\n\n${footer}` : "";
    return `git commit -m "
${header}${bodySection}${footerSection}
"`;
}
