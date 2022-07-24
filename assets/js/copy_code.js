// get the list of all highlight code blocks
const highlights = document.querySelectorAll("div.highlight");

highlights.forEach(div => {
    // create the copy button
    if (navigator.clipboard) {
        const copy = document.createElement("button");
        copy.innerHTML = "Copy";
        copy.style.display = "none";
        // add the event listener to each click
        copy.addEventListener("click", handleCopyClick);
        div.append(copy);

        div.addEventListener("mouseover", () => {
            // append the copy button to each code block
            copy.style.display = "block";
        });
        div.addEventListener("mouseout", () => {
            copy.style.display = "none";
        });
    }
});

async function handleCopyClick(evt) {
    const pre = evt.target.parentElement;
    let code = pre.querySelector("code");
    let text = code.innerText.replace(/(?=\n*)[\$>] (?=.)/g, "");
    await navigator.clipboard.writeText(text);
    evt.target.innerHTML = 'copied';
    setTimeout(() => {
        evt.target.innerHTML = 'copy';
    }, 2000);
}