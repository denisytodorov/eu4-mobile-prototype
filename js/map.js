// === MAP CONTROLLER ===
const MapController = {
    svg: null,
    provinces: {},
    onProvinceClick: null,

    async init() {
        const resp = await fetch("map.svg");
        const text = await resp.text();
        const container = document.getElementById("map-container");
        container.innerHTML = text;
        this.svg = container.querySelector("svg");

        this.svg.querySelectorAll(".province").forEach(el => {
            const id = el.id;
            this.provinces[id] = el;

            el.addEventListener("click", () => {
                if (this.onProvinceClick) this.onProvinceClick(id);
            });

            el.addEventListener("mouseenter", (e) => this.showTooltip(e, id));
            el.addEventListener("mousemove", (e) => this.moveTooltip(e));
            el.addEventListener("mouseleave", () => this.hideTooltip());
        });
    },

    updateColors(gameState) {
        for (const [provId, el] of Object.entries(this.provinces)) {
            const owner = gameState.getProvinceOwner(provId);
            if (owner && COUNTRIES[owner]) {
                el.setAttribute("fill", COUNTRIES[owner].color);
            } else {
                el.setAttribute("fill", NEUTRAL_COLOR);
            }
        }
    },

    flashProvince(provId) {
        const el = this.provinces[provId];
        if (!el) return;
        el.classList.remove("flash");
        void el.offsetWidth; // force reflow
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 600);
    },

    showTooltip(e, provId) {
        const tooltip = document.getElementById("province-tooltip");
        const prov = PROVINCES[provId];
        if (!prov) return;

        const owner = window.game ? window.game.getProvinceOwner(provId) : null;
        const ownerName = owner && COUNTRIES[owner] ? COUNTRIES[owner].name : "Uncontrolled";

        tooltip.innerHTML = `
            <div class="tooltip-name">${prov.name}</div>
            <div class="tooltip-owner">${ownerName}</div>
            <div class="tooltip-stats">Tax: ${prov.baseTax} | Manpower: ${prov.manpower}</div>
        `;
        tooltip.style.display = "block";
        this.moveTooltip(e);
    },

    moveTooltip(e) {
        const tooltip = document.getElementById("province-tooltip");
        tooltip.style.left = (e.clientX + 15) + "px";
        tooltip.style.top = (e.clientY + 15) + "px";
    },

    hideTooltip() {
        document.getElementById("province-tooltip").style.display = "none";
    }
};