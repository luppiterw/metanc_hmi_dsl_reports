// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

(() => {
    const darkThemes = ['ayu', 'navy', 'coal'];
    const lightThemes = ['light', 'rust'];

    const classList = document.getElementsByTagName('html')[0].classList;

    let lastThemeWasLight = true;
    for (const cssClass of classList) {
        if (darkThemes.includes(cssClass)) {
            lastThemeWasLight = false;
            break;
        }
    }

    const theme = lastThemeWasLight ? 'default' : 'dark';
    mermaid.initialize({ startOnLoad: false, theme });

    function setActiveMode(wrapper, mode) {
        const rendered = wrapper.querySelector('.mermaid-diagram-rendered');
        const source = wrapper.querySelector('.mermaid-diagram-source');
        const renderedButton = wrapper.querySelector('[data-mermaid-mode="rendered"]');
        const sourceButton = wrapper.querySelector('[data-mermaid-mode="source"]');

        const showRendered = mode !== 'source';
        rendered.hidden = !showRendered;
        source.hidden = showRendered;
        renderedButton.setAttribute('aria-pressed', showRendered ? 'true' : 'false');
        sourceButton.setAttribute('aria-pressed', showRendered ? 'false' : 'true');
    }

    async function enhanceDiagrams() {
        const blocks = Array.from(document.querySelectorAll('pre.mermaid'));

        for (let index = 0; index < blocks.length; index += 1) {
            const block = blocks[index];
            const source = block.textContent.trimEnd();
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-diagram';

            const toolbar = document.createElement('div');
            toolbar.className = 'mermaid-diagram-toolbar';
            toolbar.setAttribute('role', 'tablist');
            toolbar.setAttribute('aria-label', 'Mermaid diagram display mode');

            const renderedButton = document.createElement('button');
            renderedButton.type = 'button';
            renderedButton.className = 'mermaid-diagram-toggle is-active';
            renderedButton.dataset.mermaidMode = 'rendered';
            renderedButton.textContent = '图形';

            const sourceButton = document.createElement('button');
            sourceButton.type = 'button';
            sourceButton.className = 'mermaid-diagram-toggle';
            sourceButton.dataset.mermaidMode = 'source';
            sourceButton.textContent = '源码';

            toolbar.appendChild(renderedButton);
            toolbar.appendChild(sourceButton);

            const rendered = document.createElement('div');
            rendered.className = 'mermaid-diagram-rendered';

            const sourcePanel = document.createElement('pre');
            sourcePanel.className = 'mermaid-diagram-source';
            sourcePanel.textContent = source;
            sourcePanel.hidden = true;

            wrapper.appendChild(toolbar);
            wrapper.appendChild(rendered);
            wrapper.appendChild(sourcePanel);
            block.replaceWith(wrapper);

            try {
                const renderResult = await mermaid.render(`mdbook-mermaid-${index}`, source);
                rendered.innerHTML = renderResult.svg;
                if (renderResult.bindFunctions) {
                    renderResult.bindFunctions(rendered);
                }
            } catch (error) {
                rendered.innerHTML = '';
                sourcePanel.hidden = false;
                renderedButton.disabled = true;
                sourceButton.setAttribute('aria-pressed', 'true');
                console.error('Failed to render mermaid diagram', error);
            }

            renderedButton.addEventListener('click', () => setActiveMode(wrapper, 'rendered'));
            sourceButton.addEventListener('click', () => setActiveMode(wrapper, 'source'));
            setActiveMode(wrapper, 'rendered');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceDiagrams, { once: true });
    } else {
        enhanceDiagrams();
    }

    for (const darkTheme of darkThemes) {
        document.getElementById(darkTheme).addEventListener('click', () => {
            if (lastThemeWasLight) {
                window.location.reload();
            }
        });
    }

    for (const lightTheme of lightThemes) {
        document.getElementById(lightTheme).addEventListener('click', () => {
            if (!lastThemeWasLight) {
                window.location.reload();
            }
        });
    }
})();
