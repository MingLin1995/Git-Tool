window.onload = () => {
  const commitType = document.getElementById(
    "commit-type",
  ) as HTMLSelectElement;
  const scopeInput = document.getElementById("scope") as HTMLInputElement;
  const titleInput = document.getElementById("title") as HTMLInputElement;
  const bodyTextarea = document.getElementById("body") as HTMLTextAreaElement;

  const clickUpInput = document.getElementById("clickUp") as HTMLInputElement;
  const resolvesInput = document.getElementById("resolves") as HTMLInputElement;
  const seeAlsoInput = document.getElementById("seeAlso") as HTMLInputElement;

  const generateButton = document.getElementById(
    "generate",
  ) as HTMLButtonElement;
  const commitMessagePre = document.getElementById(
    "commit-message",
  ) as HTMLPreElement;
  const copyButton = document.getElementById("copy") as HTMLButtonElement;

  // Mode tabs removed – always show Git command preview

  let previewMode: "command" = "command";

  // Template triggers on select type change
  commitType.addEventListener("change", () => {
    switch (commitType.value) {
      case "feat":
      case "modify":
        bodyTextarea.value = "目的 / 需求：\n- \n\n調整內容：\n- ";
        break;
      case "fix":
        bodyTextarea.value = "問題：\n- \n\n原因：\n- \n\n解決方式：\n- ";
        break;
      default:
        bodyTextarea.value = "";
    }
    updatePreview();
  });

  // Real-time updates on keypresses or changes
  const updateTriggers = [
    scopeInput,
    titleInput,
    bodyTextarea,
    clickUpInput,
    resolvesInput,
    seeAlsoInput,
  ];

  updateTriggers.forEach((el) => {
    el.addEventListener("input", updatePreview);
  });

  // No mode switching – always preview Git command

  // Generate button fallback (though real-time update covers it)
  generateButton.addEventListener("click", updatePreview);

  function updatePreview() {
    const type = commitType.value;
    const scope = scopeInput.value.trim();
    const title = titleInput.value.trim();
    const body = bodyTextarea.value.trim();

    const clickUp = clickUpInput.value.trim();
    const resolves = resolvesInput.value.trim();
    const seeAlso = seeAlsoInput.value.trim();

    // Construct Footer
    const footerLines: string[] = [];
    if (clickUp && clickUp !== "CU-") {
      footerLines.push(clickUp);
    }
    if (resolves && resolves !== "Resolves: #") {
      footerLines.push(resolves);
    }
    if (seeAlso && seeAlso !== "See also: #") {
      footerLines.push(seeAlso);
    }
    const footer = footerLines.join("\n");

    const message = generateCommitMessage(
      type,
      scope,
      title,
      body,
      footer,
      "command",
    );
    // Safety: use textContent to avoid XSS vector
    commitMessagePre.textContent = message;
  }

  // Copy Action
  copyButton.addEventListener("click", () => {
    const commitMessage = commitMessagePre.textContent || "";
    navigator.clipboard
      .writeText(commitMessage)
      .then(() => {
        const notification = document.getElementById("copy-notification");
        if (notification) {
          notification.style.display = "flex";
          setTimeout(() => {
            notification.style.display = "none";
          }, 3000);
        }
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  });

  // Initial update
  updatePreview();
};

/**
 * Escapes single quotes for use inside shell single-quoted strings.
 * Example: don't -> don'\''t
 */
function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "'\\''");
}

function generateCommitMessage(
  type: string,
  scope: string,
  subject: string,
  body: string,
  footer: string,
  mode: "raw" | "command",
): string {
  // 1. Build header: type(scope): subject or type: subject (using standard half-width colon)
  let header = type || "[type]";
  if (scope) {
    header += `(${scope})`;
  }
  header += `: ${subject || "[subject]"}`;

  // 2. Build full text commit message
  const bodySection = body ? `\n\n${body}` : "";
  const footerSection = footer ? `\n\n${footer}` : "";
  const fullRawMessage = `${header}${bodySection}${footerSection}`;

  // 3. Output based on chosen copy mode
  if (mode === "command") {
    // Escape single quotes inside message body for safe shell execution
    const escapedMessage = escapeSingleQuotes(fullRawMessage);
    return `git commit -m '${escapedMessage}'`;
  }

  return fullRawMessage;
}
