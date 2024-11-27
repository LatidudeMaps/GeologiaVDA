class CopyrightControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._logo = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl';
        this._container.style.pointerEvents = 'auto';
        
        // Create copyright panel
        const panel = document.createElement('div');
        panel.style.padding = '8px 10px';
        panel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        panel.style.backdropFilter = 'blur(8px)';
        panel.style.WebkitBackdropFilter = 'blur(8px)';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        panel.style.fontSize = '12px';
        panel.style.lineHeight = '1.4';
        panel.style.maxWidth = '300px';

        // Create wrapper for hover effect
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';
        wrapper.style.position = 'relative';

        // Carica il logo da URL
        this._loadLogo().then(logoElement => {
            wrapper.insertBefore(logoElement, wrapper.firstChild);
        });

        // Add text container
        const textContainer = document.createElement('div');
        textContainer.style.position = 'relative';

        // Add main text
        const mainText = document.createElement('div');
        mainText.textContent = 'Val d Agri 3D Geological Tour';
        mainText.style.fontWeight = '500';
        mainText.style.color = '#1a1a1a';
        textContainer.appendChild(mainText);

        // Add author text
        const authorText = document.createElement('div');
        authorText.textContent = 'by Michele Tricarico / LatidudeMaps';
        authorText.style.color = '#666666';
        authorText.style.fontSize = '11px';
        textContainer.appendChild(authorText);

        wrapper.appendChild(textContainer);

        // Add expanded content
        const expandedContent = document.createElement('div');
        expandedContent.style.marginTop = '0';
        expandedContent.style.borderTop = '1px solid rgba(0, 0, 0, 0.1)';
        expandedContent.style.paddingTop = '0';
        expandedContent.style.maxHeight = '0';
        expandedContent.style.overflow = 'hidden';
        expandedContent.style.opacity = '0';
        expandedContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        expandedContent.style.transform = 'translateY(-10px)';

        // Add links
        const links = [
            { icon: 'link', text: 'Read the Paper', url: 'https://doi.org/10.1080/17445647.2023.2257729' },
            { icon: 'link', text: 'Links & Social Media', url: 'https://linktr.ee/latidudemaps' },
            { icon: 'globe', text: 'Visit Website', url: 'https://latidudemaps.github.io/' },
            { icon: 'github', text: 'View on GitHub', url: 'https://github.com/LatidudeMaps' }
        ];

        links.forEach(link => {
            const linkElement = this._createLink(link);
            expandedContent.appendChild(linkElement);
        });

        // Add copyright text
        const copyright = document.createElement('div');
        copyright.style.marginTop = '8px';
        copyright.style.color = '#666666';
        copyright.style.fontSize = '11px';
        copyright.textContent = `© ${new Date().getFullYear()} - All rights reserved`;
        expandedContent.appendChild(copyright);

        // Add hover effects
        panel.addEventListener('mouseenter', () => {
            panel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            panel.style.transform = 'translateY(-2px)';
            panel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            expandedContent.style.marginTop = '8px';
            expandedContent.style.paddingTop = '8px';
            expandedContent.style.maxHeight = '200px';
            expandedContent.style.opacity = '1';
            expandedContent.style.transform = 'translateY(0)';
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            panel.style.transform = 'translateY(0)';
            panel.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            expandedContent.style.marginTop = '0';
            expandedContent.style.paddingTop = '0';
            expandedContent.style.maxHeight = '0';
            expandedContent.style.opacity = '0';
            expandedContent.style.transform = 'translateY(-10px)';
        });

        panel.appendChild(wrapper);
        panel.appendChild(expandedContent);
        this._container.appendChild(panel);
        
        return this._container;
    }

    async _loadLogo() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/latidudemaps/GeologiaVDA/main/data/logo_dark.svg');
            const svgText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = doc.querySelector('svg');
            
            if (svgElement) {
                // Crea un container per l'SVG che gestirà l'animazione
                const container = document.createElement('div');
                container.style.width = '24px';
                container.style.height = '24px';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                
                // Imposta le dimensioni e lo stile dell'SVG
                svgElement.setAttribute('width', '24');
                svgElement.setAttribute('height', '24');
                svgElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                container.appendChild(svgElement);
                
                // Applica l'hover effect al parent panel invece che al container
                const parentPanel = this._container.querySelector('div');
                if (parentPanel) {
                    parentPanel.addEventListener('mouseenter', () => {
                        svgElement.style.transform = 'scale(1.1)';
                    });
                    
                    parentPanel.addEventListener('mouseleave', () => {
                        svgElement.style.transform = 'scale(1)';
                    });
                }
                
                return container;
            } else {
                throw new Error('SVG element not found in response');
            }
        } catch (error) {
            console.error('Error loading logo:', error);
            const fallback = document.createElement('div');
            fallback.textContent = '🗺️';
            fallback.style.fontSize = '20px';
            return fallback;
        }
    }

    _createLink({ icon, text, url }) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.gap = '8px';
        link.style.textDecoration = 'none';
        link.style.color = '#666666';
        link.style.padding = '4px 0';
        link.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const iconSvg = this._getSocialIcon(icon);
        if (iconSvg) {
            link.appendChild(iconSvg);
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        link.appendChild(textSpan);

        link.addEventListener('mouseenter', () => {
            link.style.color = '#000000';
            link.style.transform = 'translateX(4px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.color = '#666666';
            link.style.transform = 'translateX(0)';
        });

        return link;
    }

    _getSocialIcon(type) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        switch (type) {
            case 'github':
                svg.innerHTML = `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>`;
                break;
            case 'link':
                svg.innerHTML = `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`;
                break;
            case 'globe':
                svg.innerHTML = `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`;
                break;
            default:
                return null;
        }

        return svg;
    }

    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = null;
    }
}

export default CopyrightControl;