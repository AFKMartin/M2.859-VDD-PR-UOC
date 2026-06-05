// Constantes
const COLORS = [
    "rgb(0, 229, 255)",
    "rgb(255, 107, 53)",
    "rgb(162, 89, 255)",
    "rgb(57, 255, 20)",
    "rgb(255, 210, 63)",
    "rgb(255, 77, 109)",
    "rgb(76, 201, 240)",
    "rgb(247, 37, 133)",
    "rgb(114, 9, 183)",
    "rgb(58, 134, 255)",
    "rgb(6, 214, 160)",
    "rgb(239, 71, 111)",
    "rgb(17, 138, 178)",
    "rgb(255, 209, 102)",
    "rgb(7, 59, 76)"
];

const AGENT_ORDER = [
    "Yes, I use AI agents at work daily",
    "Yes, I use AI agents at work weekly",
    "Yes, I use AI agents at work monthly or infrequently",
    "No, but I plan to",
    "No, I use AI exclusively in copilot/autocomplete mode",
    "No, and I don't plan to"
];

// Tooltip
const tooltip = document.getElementById("tooltip");

function showTip(html, e) {
    tooltip.innerHTML = html;
    tooltip.style.display = "block";
    moveTip(e);
}
function moveTip(e) {
    const x = e.clientX + 14, y = e.clientY - 10;
    tooltip.style.left = Math.min(x, window.innerWidth - 260) + "px";
    tooltip.style.top  = Math.min(y, window.innerHeight - 80) + "px";
}
function hideTip() { tooltip.style.display = "none"; }

// Tabs
function switchTab(name) {
    const names = ["models", "orchestration", "external"];
    document.querySelectorAll(".tab").forEach((t, i) => {
        t.classList.toggle("active", names[i] === name);
    });
    document.querySelectorAll(".tab-panel").forEach(p => {
        p.classList.toggle("active", p.id === "tab-" + name);
    });
}

// Barra horizontal
function hBar(containerId, data, keyX, keyY, color, maxW) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = maxW || el.offsetWidth || 400;
    const rowH = 28;
    const margin = { l: 180, r: 70, t: 10, b: 10 };
    const H = data.length * rowH + margin.t + margin.b;
    const innerW = W - margin.l - margin.r;

    d3.select("#" + containerId).select("svg").remove();
    const svg = d3.select("#" + containerId).append("svg").attr("width", W).attr("height", H);
    const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);

    const xMax = d3.max(data, d => d[keyX]);
    const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);
    const y = d3.scaleBand().domain(data.map(d => d[keyY])).range([0, H - margin.t - margin.b]).padding(0.25);

    g.selectAll("rect").data(data).join("rect")
        .attr("x", 0)
        .attr("y", d => y(d[keyY]))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[keyX]))
        .attr("fill", (d, i) => Array.isArray(color) ? color[i % color.length] : color)
        .attr("rx", 2)
        .on("mouseover", (e, d) => showTip(`<b>${d[keyY]}</b><br>${d[keyX].toLocaleString()}`, e))
        .on("mousemove", moveTip)
        .on("mouseleave", hideTip);

    g.selectAll(".val").data(data).join("text")
        .attr("class", "val")
        .attr("x", d => x(d[keyX]) + 6)
        .attr("y", d => y(d[keyY]) + y.bandwidth() / 2 + 4)
        .attr("fill", "rgb(122, 122, 154)")
        .attr("font-size", "10px")
        .text(d => typeof d[keyX] === "number" && d[keyX] < 100
        ? d[keyX].toFixed(1) + "%"
        : d[keyX].toLocaleString());

    g.selectAll(".label").data(data).join("text")
        .attr("class", "label")
        .attr("x", -8)
        .attr("y", d => y(d[keyY]) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", "rgb(192, 192, 216)")
        .attr("font-size", "10px")
        .text(d => {
        const s = String(d[keyY]);
        return s.length > 28 ? s.slice(0, 26) + "…" : s;
    });
}

// Donut
function donut(containerId, data, keyName, keyVal, colors, labelFn) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const size = 160;
    const radius = size / 2;

    d3.select("#" + containerId).select("svg").remove();
    const wrap = d3.select("#" + containerId);
    const svg = wrap.append("svg").attr("width", size).attr("height", size);
    const g = svg.append("g").attr("transform", `translate(${radius},${radius})`);

    const pie = d3.pie().value(d => d[keyVal]).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius - 4);

    g.selectAll("path").data(pie(data)).join("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colors[i % colors.length])
        .attr("stroke", "#0a0a0f")
        .attr("stroke-width", 2)
        // Cálculo de porcentajes
        .on("mouseover", (e, d) => {
            const total = d3.sum(data, x => x[keyVal]);
            const pct = (d.data[keyVal] / total * 100).toFixed(1);
            showTip(`<b>${d.data[keyName]}</b><br>${d.data[keyVal].toLocaleString()} (${pct}%)`, e)
        })
        .on("mousemove", moveTip)
        .on("mouseleave", hideTip);

    const legend = wrap.append("div").attr("class", "legend");
    data.forEach((d, i) => {
        const item = legend.append("div").attr("class", "legend-item");
        item.append("div").attr("class", "legend-dot").style("background", colors[i % colors.length]);
        item.append("span").text(d[keyName]);
    });
}

// Barra threat vs agents 
function stackedThreat(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = el.offsetWidth || 700;
    const H = 310;
    const margin = { l: 260, r: 120, t: 30, b: 20 };
    const innerW = W - margin.l - margin.r;

    const threats = ["No", "I'm not sure", "Yes"];
    const threatColors = { "No": "rgb(57, 255, 20)", "I'm not sure": "rgb(255, 210, 63)", "Yes": "rgb(255, 77, 109)" };
    const agents = [...new Set(data.map(d => d.AIAgents))];

    const pivot = {};
    agents.forEach(a => {
        pivot[a] = {};
        threats.forEach(t => { pivot[a][t] = 0; });
    });
    data.forEach(d => {
        if (pivot[d.AIAgents] !== undefined) pivot[d.AIAgents][d.AIThreat] = d.count;
    });

    const rows = agents.map(a => {
        const total = threats.reduce((s, t) => s + (pivot[a][t] || 0), 0);
        const row = { agent: a };
        threats.forEach(t => { row[t] = total ? (pivot[a][t] || 0) / total * 100 : 0; });
        return row;
    });

    rows.sort((a, b) => AGENT_ORDER.indexOf(a.agent) - AGENT_ORDER.indexOf(b.agent));

    d3.select("#" + containerId).select("svg").remove();
    const svg = d3.select("#" + containerId).append("svg").attr("width", W).attr("height", H);
    const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);

    const y = d3.scaleBand().domain(rows.map(r => r.agent)).range([0, H - margin.t - margin.b]).padding(0.3);
    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);

    const xOffsets = {};
    rows.forEach(r => { xOffsets[r.agent] = 0; });

    threats.forEach(t => {
        const safeClass = t.replace(/[^a-zA-Z0-9]/g, "_");
        g.selectAll("rect." + safeClass).data(rows).join("rect")
        .attr("class", safeClass)
        .attr("y", r => y(r.agent))
        .attr("x", r => x(xOffsets[r.agent]))
        .attr("width", r => x(r[t]))
        .attr("height", y.bandwidth())
        .attr("fill", threatColors[t])
        .attr("opacity", 0.85)
        .on("mouseover", (e, r) => showTip(`<b>${r.agent.slice(0, 40)}</b><br>${t}: <b>${r[t].toFixed(1)}%</b>`, e))
        .on("mousemove", moveTip)
        .on("mouseleave", hideTip);
        rows.forEach(r => { xOffsets[r.agent] += r[t]; });
    });

    g.selectAll(".yl").data(rows).join("text")
        .attr("class", "yl")
        .attr("x", -8)
        .attr("y", r => y(r.agent) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", "rgb(192, 192, 216)")
        .attr("font-size", "9.5px")
        .text(r => r.agent.length > 38 ? r.agent.slice(0, 36) + "…" : r.agent);

    const legG = svg.append("g").attr("transform", `translate(${margin.l}, ${H - 18})`);
    threats.forEach((t, i) => {
        legG.append("rect").attr("x", i * 110).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", threatColors[t]).attr("rx", 2);
        legG.append("text").attr("x", i * 110 + 14).attr("y", 9).attr("fill", "rgb(192, 192, 216)").attr("font-size", "9px").text(t);
    });
}

// Mapamundi
async function drawMap(adoptionData) {
    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");

    const nameIndex = {};
    adoptionData.forEach(d => { nameIndex[d.Country.toLowerCase().trim()] = d.adoption_pct; });

    const isoNames = {
        4:"Afghanistan",8:"Albania",12:"Algeria",24:"Angola",32:"Argentina",36:"Australia",
        40:"Austria",50:"Bangladesh",56:"Belgium",68:"Bolivia",76:"Brazil",100:"Bulgaria",
        116:"Cambodia",124:"Canada",152:"Chile",156:"China",170:"Colombia",191:"Croatia",
        203:"Czech Republic",208:"Denmark",818:"Egypt",231:"Ethiopia",246:"Finland",
        251:"France",276:"Germany",288:"Ghana",300:"Greece",320:"Guatemala",
        356:"India",360:"Indonesia",364:"Iran",368:"Iraq",372:"Ireland",376:"Israel",
        380:"Italy",388:"Jamaica",392:"Japan",400:"Jordan",398:"Kazakhstan",404:"Kenya",
        410:"South Korea",414:"Kuwait",422:"Lebanon",458:"Malaysia",484:"Mexico",
        504:"Morocco",524:"Nepal",528:"Netherlands",554:"New Zealand",566:"Nigeria",
        578:"Norway",586:"Pakistan",604:"Peru",608:"Philippines",616:"Poland",
        620:"Portugal",642:"Romania",643:"Russia",682:"Saudi Arabia",
        688:"Serbia",703:"Slovakia",705:"Slovenia",710:"South Africa",
        724:"Spain",144:"Sri Lanka",752:"Sweden",756:"Switzerland",158:"Taiwan",
        764:"Thailand",792:"Turkey",800:"Uganda",804:"Ukraine",784:"United Arab Emirates",
        826:"United Kingdom of Great Britain and Northern Ireland",
        840:"United States of America",858:"Uruguay",862:"Venezuela",704:"Vietnam",
    };

    const svg = d3.select("#world-map");
    const W = document.getElementById("map-container").offsetWidth;
    const H = 420;
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    const projection = d3.geoNaturalEarth1().scale(W / 6.5).translate([W / 2, H / 2]);
    const path = d3.geoPath().projection(projection);
    const colorScale = d3.scaleSequential().domain([0, 80]).interpolator(d3.interpolate("rgb(26, 26, 58)", "rgb(0, 229, 255)"));

    const countries = topojson.feature(world, world.objects.countries);

    svg.selectAll(".map-country").data(countries.features).join("path")
        .attr("class", "map-country")
        .attr("d", path)
        .attr("fill", d => {
        const name = isoNames[+d.id];
        if (!name) return "rgb(26, 26, 46)";
        const pct = nameIndex[name.toLowerCase().trim()];
        return pct != null ? colorScale(pct) : "rgb(26, 26, 46)";
        })
        .on("mouseover", (e, d) => {
        const name = isoNames[+d.id];
        if (!name) return;
        const pct = nameIndex[name.toLowerCase().trim()];
        if (pct != null) showTip(`<b>${name}</b><br>Adopción: <b>${pct}%</b>`, e);
        })
        .on("mousemove", moveTip)
        .on("mouseleave", hideTip);

    // colors de la leyenda
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "mapGrad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "rgb(26, 26, 58)");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "rgb(0, 229, 255)");

    const legG = svg.append("g").attr("transform", `translate(20, ${H - 35})`);
    legG.append("rect").attr("width", 160).attr("height", 10).attr("fill", "url(#mapGrad)").attr("rx", 2);
    legG.append("text").attr("x", 0).attr("y", 22).attr("fill", "rgb(122, 122, 154)").attr("font-size", "9px").text("0%");
    legG.append("text").attr("x", 160).attr("y", 22).attr("fill", "rgb(122, 122, 154)").attr("font-size", "9px").attr("text-anchor", "end").text("80%");
    legG.append("text").attr("x", 80).attr("y", 22).attr("fill", "rgb(122, 122, 154)").attr("font-size", "9px").attr("text-anchor", "middle").text("adopción AI Agents");
}

function drawWordCloud(data) {
    const el = document.getElementById("wordcloud");
    if (!el) return;
    const W = el.parentElement.offsetWidth - 48 || 500;
    const H = 420;
    const cx = W / 2, cy = H / 2;

    const svg = d3.select("#wordcloud")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("width", W).attr("height", H);

    const maxCount = d3.max(data, d => d.count);
    const fontSize = d => 10 + (d.count / maxCount) * 32;

    // Estima el ancho de una palabra en píxeles
    function estimateWidth(word, fs) {
        return word.length * fs * 0.6;
    }

    // Comprueba si dos cajas se solapan con margen
    function overlaps(a, b) {
        const margin = 6;
        return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + margin &&
               Math.abs(a.y - b.y) < (a.h + b.h) / 2 + margin;
    }

    const placed = [];

    data.slice(0, 60).forEach((d, i) => {
        const fs = fontSize(d);
        const w = estimateWidth(d.word, fs);
        const h = fs * 1.2;

        // Intenta colocar en espiral desde el centro hacia fuera
        let found = false;
        for (let r = 0; r < Math.min(cx, cy) && !found; r += 4) {
            const steps = Math.max(1, Math.round(2 * Math.PI * r / 18));
            for (let s = 0; s < steps && !found; s++) {
                const angle = (s / steps) * 2 * Math.PI + i * 0.5;
                const px = cx + r * Math.cos(angle);
                const py = cy + r * Math.sin(angle) * 0.7;

                // Verifica que esté dentro del SVG
                if (px - w/2 < 4 || px + w/2 > W - 4) continue;
                if (py - h/2 < 4 || py + h/2 > H - 4) continue;

                const candidate = { x: px, y: py, w, h };
                if (!placed.some(p => overlaps(candidate, p))) {
                    placed.push({ ...d, fs, x: px, y: py, w, h });
                    found = true;
                }
            }
        }
    });

    svg.selectAll("text").data(placed).join("text")
        .attr("class", "word")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("font-size", d => d.fs)
        .attr("font-family", "Syne, sans-serif")
        .attr("font-weight", d => d.fs > 28 ? 700 : 400)
        .attr("fill", (d, i) => COLORS[i % COLORS.length])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("opacity", d => 0.65 + (d.count / maxCount) * 0.35)
        .text(d => d.word)
        .on("mouseover", (e, d) => showTip(`<b>${d.word}</b><br>menciones: ${d.count}`, e))
        .on("mousemove", moveTip)
        .on("mouseleave", hideTip);
}

// Salarios
    function drawSalary(data) {
    const top = data
        .sort((a, b) => b.salary_median_usd - a.salary_median_usd)
        .slice(0, 30)
        .map(d => ({
        country: d.Country.length > 30 ? d.Country.slice(0, 28) + "…" : d.Country,
        salary: Math.round(d.salary_median_usd / 1000)
        }));

    hBar("salary-chart", top, "salary", "country", COLORS, null);

    d3.selectAll("#salary-chart .val").each(function (d) {
        d3.select(this).text(d.salary + "K USD");
    });
}

// Main
async function main() {
    console.log("Main correcto")
    const base = "data/";

    const [
        adoptionDist, adoptionDevtype, adoptionCountry,
        jobsatAgents, aithreat, newrole, threatAgents,
        models, orchestration, external,
        salaryCountry, words
    ] = await Promise.all([
        d3.json(base + "p1_adoption_dist.json"),
        d3.json(base + "p1_adoption_devtype.json"),
        d3.json(base + "p1_adoption_country.json"),
        d3.json(base + "p2_jobsat_agents.json"),
        d3.json(base + "p2_aithreat.json"),
        d3.json(base + "p2_newrole.json"),
        d3.json(base + "p2_threat_agents.json"),
        d3.json(base + "p3_models.json"),
        d3.json(base + "p3_orchestration.json"),
        d3.json(base + "p3_external.json"),
        d3.json(base + "p4_salary_country.json"),
        // d3.json(base + "p4_salary_adoption.json"),
        d3.json(base + "p5_aiopen_words.json"),
    ]);

    // P1
    const total = adoptionDist.reduce((acc, d) => acc + d.count, 0);
    const adoptionWithPct = adoptionDist.map(d => ({
        ...d,
        pct: (d.count / total * 100).toFixed(1)
    }));
    
    donut("donut-adoption", adoptionDist, "category", "count", [
    "rgb(255, 75, 75)",   // No, and I don't plan to
    "rgb(247, 231, 0)",   // No, but I plan to
    "rgb(186, 255, 89)",   // Yes, daily 
    "rgb(255, 159, 67)",   // No, copilot only
    "rgb(76, 201, 240)",   // Yes, weekly
    "rgb(136, 0, 255)",   // Yes, monthly
    ]);

    hBar("bar-devtype", adoptionDevtype.slice(0, 15), "adoption_pct", "DevType", COLORS);
    drawMap(adoptionCountry);

    const adoptionAge = await d3.json(base + "p1_adoption_age.json");
        (function() {
            const data = adoptionAge.filter(d => d.Age !== "Prefer not to say");
            const el = document.getElementById("bar-age");
            if (!el) return;
            const W = el.offsetWidth || 600;
            const rowH = 32, margin = { l: 140, r: 70, t: 10, b: 10 };
            const H = data.length * rowH + margin.t + margin.b;
            const innerW = W - margin.l - margin.r;

            const x = d3.scaleLinear().domain([0, 50]).range([0, innerW]);
            const y = d3.scaleBand().domain(data.map(d => d.Age)).range([0, H - margin.t - margin.b]).padding(0.25);

            // Color por valor: más adopción = más azul
            const colorScale = d3.scaleSequential()
                .domain([15, 40])
                .interpolator(d3.interpolate("rgb(255,107,53)", "rgb(0,229,255)"));

            d3.select("#bar-age").select("svg").remove();
            const svg = d3.select("#bar-age").append("svg").attr("width", W).attr("height", H);
            const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);

            g.selectAll("rect").data(data).join("rect")
                .attr("x", 0).attr("y", d => y(d.Age))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.adoption_pct))
                .attr("fill", d => colorScale(d.adoption_pct))
                .attr("rx", 2)
                .on("mouseover", (e, d) => showTip(`<b>${d.Age}</b><br>Adopción: <b>${d.adoption_pct}%</b>`, e))
                .on("mousemove", moveTip)
                .on("mouseleave", hideTip);

            g.selectAll(".val").data(data).join("text")
                .attr("class", "val")
                .attr("x", d => x(d.adoption_pct) + 6)
                .attr("y", d => y(d.Age) + y.bandwidth() / 2 + 4)
                .attr("fill", "rgb(122,122,154)").attr("font-size", "10px")
                .text(d => d.adoption_pct + "%");

            g.selectAll(".label").data(data).join("text")
                .attr("class", "label")
                .attr("x", -8).attr("y", d => y(d.Age) + y.bandwidth() / 2 + 4)
                .attr("text-anchor", "end").attr("fill", "rgb(192,192,216)").attr("font-size", "10px")
                .text(d => d.Age);
        })();

    // P2
    donut("donut-aithreat", aithreat, "category", "count",
        ["rgb(57, 255, 20)", "rgb(255, 210, 63)", "rgb(255, 77, 109)"]);

    const roleShort = newrole.map(d => ({
        label: d.category.replace("I have ", "").replace("career and/or the industry I work in", "career"),
        count: d.count
    }));
    hBar("bar-newrole", roleShort, "count", "label", COLORS);
    stackedThreat("stacked-threat", threatAgents);

    const jobsatDiff = await d3.json(base + "p2_jobsat_factors_split.json");

    // Gráfico de divergencia
    (function() {
        const el = document.getElementById("bar-jobsat-diff");
        if (!el) return;
        const W = el.offsetWidth || 600;
        const rowH = 26;
        const margin = { l: 200, r: 120, t: 10, b: 45 };
        const H = jobsatDiff.length * rowH + margin.t + margin.b;
        const innerW = W - margin.l - margin.r;

        const maxAbs = d3.max(jobsatDiff, d => Math.abs(d.diff));
        const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, innerW]);
        const y = d3.scaleBand().domain(jobsatDiff.map(d => d.factor)).range([0, H - margin.t - margin.b]).padding(0.25);
        const mid = x(0);

        d3.select("#bar-jobsat-diff").select("svg").remove();
        const svg = d3.select("#bar-jobsat-diff").append("svg").attr("width", W).attr("height", H);
        const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);

        // Línea central
        g.append("line")
            .attr("x1", mid).attr("x2", mid)
            .attr("y1", 0).attr("y2", H - margin.t - margin.b)
            .attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-width", 1);

        // Barras
        g.selectAll("rect").data(jobsatDiff).join("rect")
            .attr("x", d => d.diff < 0 ? x(d.diff) : mid)
            .attr("y", d => y(d.factor))
            .attr("width", d => Math.abs(x(d.diff) - mid))
            .attr("height", y.bandwidth())
            .attr("fill", d => d.diff < 0 ? "rgb(0, 229, 255)" : "rgb(255, 107, 53)")
            .attr("rx", 2)
            .on("mouseover", (e, d) => showTip(
                `<b>${d.factor}</b><br>
                Usuarios AI: <b>${d.yes_agents.toFixed(2)}</b><br>
                No usuarios: <b>${d.no_agents.toFixed(2)}</b><br>
                Diferencia: <b>${d.diff > 0 ? '+' : ''}${d.diff.toFixed(2)}</b>`,
                e))
            .on("mousemove", moveTip)
            .on("mouseleave", hideTip);

        // Labels izquierda
        g.selectAll(".label").data(jobsatDiff).join("text")
            .attr("class", "label")
            .attr("x", -8).attr("y", d => y(d.factor) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "end").attr("fill", "rgb(192,192,216)").attr("font-size", "10px")
            .text(d => d.factor);

        // Valores
        g.selectAll(".val").data(jobsatDiff).join("text")
            .attr("class", "val")
            .attr("x", d => d.diff < 0 ? x(d.diff) - 8 : x(d.diff) + 8)
            .attr("y", d => y(d.factor) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", d => d.diff < 0 ? "end" : "start")
            .attr("fill", "rgb(122,122,154)").attr("font-size", "9px")
            .text(d => (d.diff > 0 ? "+" : "") + d.diff.toFixed(2));

        // Leyenda
        const legG = svg.append("g").attr("transform", `translate(${margin.l + mid - 80}, ${H - 28})`);
        legG.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "rgb(0,229,255)").attr("rx", 2);
        legG.append("text").attr("x", 14).attr("y", 9).attr("fill", "rgb(192,192,216)").attr("font-size", "9px").text("más importante para no-usuarios");
        legG.append("rect").attr("x", 0).attr("y", 16).attr("width", 10).attr("height", 10).attr("fill", "rgb(255,107,53)").attr("rx", 2);
        legG.append("text").attr("x", 14).attr("y", 25).attr("fill", "rgb(192,192,216)").attr("font-size", "9px").text("más importante para usuarios AI");
    })();

    // P3
    hBar("bar-models", models, "count", "tool", COLORS);
    hBar("bar-orchestration", orchestration, "count", "tool", COLORS);
    hBar("bar-external", external, "count", "tool", COLORS);

    // P4
    drawSalary(salaryCountry);
    
    const salaryAdoption = await d3.json(base + "p4_salary_adoption.json");
        (function() {
            const el = document.getElementById("scatter-salary");
            if (!el) return;
            const W = el.offsetWidth || 700;
            const H = 420;
            const margin = { l: 60, r: 140, t: 20, b: 50 };
            const innerW = W - margin.l - margin.r;
            const innerH = H - margin.t - margin.b;

            d3.select("#scatter-salary").select("svg").remove();
            const svg = d3.select("#scatter-salary").append("svg").attr("width", W).attr("height", H);
            const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);

            const x = d3.scaleLinear()
                .domain([0, d3.max(salaryAdoption, d => d.salary_median) * 1.05])
                .range([0, innerW]);
            const y = d3.scaleLinear()
                .domain([0, d3.max(salaryAdoption, d => d.adoption_pct) * 1.1])
                .range([innerH, 0]);
            const r = d3.scaleSqrt()
                .domain([0, d3.max(salaryAdoption, d => d.n)])
                .range([3, 18]);

            // Línea de tendencia
            const xMean = d3.mean(salaryAdoption, d => d.salary_median);
            const yMean = d3.mean(salaryAdoption, d => d.adoption_pct);
            const slope = d3.sum(salaryAdoption, d => (d.salary_median - xMean) * (d.adoption_pct - yMean)) /
                        d3.sum(salaryAdoption, d => Math.pow(d.salary_median - xMean, 2));
            const intercept = yMean - slope * xMean;
            const x1 = 0, x2 = d3.max(salaryAdoption, d => d.salary_median) * 1.05;

            g.append("line")
                .attr("x1", x(x1)).attr("y1", y(intercept + slope * x1))
                .attr("x2", x(x2)).attr("y2", y(intercept + slope * x2))
                .attr("stroke", "rgba(255,255,255,0.15)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4");

            // Ejes
            g.append("g").attr("transform", `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(6).tickFormat(d => d/1000 + "K"))
                .selectAll("text").attr("fill", "rgb(122,122,154)").attr("font-size", "9px");
            g.append("g")
                .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + "%"))
                .selectAll("text").attr("fill", "rgb(122,122,154)").attr("font-size", "9px");

            g.selectAll(".domain, .tick line").attr("stroke", "rgba(255,255,255,0.1)");

            // Labels ejes
            g.append("text").attr("x", innerW/2).attr("y", innerH + 38)
                .attr("text-anchor", "middle").attr("fill", "rgb(122,122,154)").attr("font-size", "10px")
                .text("Salario mediano (USD)");
            g.append("text").attr("transform", "rotate(-90)")
                .attr("x", -innerH/2).attr("y", -45)
                .attr("text-anchor", "middle").attr("fill", "rgb(122,122,154)").attr("font-size", "10px")
                .text("Adopción AI Agents (%)");

            // Puntos
            const colorScale = d3.scaleSequential()
                .domain([0, d3.max(salaryAdoption, d => d.salary_median)])
                .interpolator(d3.interpolate("rgb(0,229,255)", "rgb(255,107,53)"));

            g.selectAll("circle").data(salaryAdoption).join("circle")
                .attr("cx", d => x(d.salary_median))
                .attr("cy", d => y(d.adoption_pct))
                .attr("r", d => r(d.n))
                .attr("fill", d => colorScale(d.salary_median))
                .attr("opacity", 0.75)
                .attr("stroke", "rgba(255,255,255,0.2)")
                .attr("stroke-width", 1)
                .on("mouseover", (e, d) => showTip(
                    `<b>${d.Country}</b><br>
                    Salario: <b>${(d.salary_median/1000).toFixed(0)}K USD</b><br>
                    Adopción: <b>${d.adoption_pct}%</b><br>
                    Respuestas: <b>${d.n}</b>`,
                    e))
                .on("mousemove", moveTip)
                .on("mouseleave", hideTip);

            // Labels por países destacados
            const highlight = ["United States of America", "India", "Germany",
                            "Pakistan", "Egypt", "Switzerland", "Bangladesh"];
            g.selectAll(".clabel").data(salaryAdoption.filter(d => highlight.includes(d.Country)))
                .join("text").attr("class", "clabel")
                .attr("x", d => x(d.salary_median) + r(d.n) + 3)
                .attr("y", d => y(d.adoption_pct) + 4)
                .attr("fill", "rgb(192,192,216)").attr("font-size", "9px")
                .text(d => d.Country.replace("United States of America", "USA")
                                    .replace("United Kingdom of Great Britain and Northern Ireland", "UK"));
        })();

    const salaryGap = await d3.json(base + "p4_salary_gender.json");
        (function() {
            const el = document.getElementById("gender-bars");
            if (!el) return;

            const W = el.offsetWidth || 700;
            const H = salaryGap.length * 22 + 40;
            const margin = { l: 120, r: 80, t: 20, b: 20 };
            const innerW = W - margin.l - margin.r;
            const innerH = H - margin.t - margin.b;

            d3.select("#gender-bars").select("svg").remove();
            const svg = d3.select("#gender-bars").append("svg")
                .attr("width", W)
                .attr("height", H);

            const g = svg.append("g")
                .attr("transform", `translate(${margin.l},${margin.t})`);

            // Escalas
            const y = d3.scaleBand()
                .domain(salaryGap.map(d => d.country))
                .range([0, innerH])
                .padding(0.2);

            const totalMax = d3.max(salaryGap, d => d.male + d.female);
            
            const x = d3.scaleLinear()
                .domain([0, totalMax])
                .range([0, innerW]);

            // Eje Y
            g.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("fill", "rgb(192,192,216)")
                .attr("font-size", "10px");

            // Barras male
            g.selectAll(".male")
                .data(salaryGap)
                .join("rect")
                .attr("class", "male")
                .attr("x", 0)
                .attr("y", d => y(d.country))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.male))
                .attr("fill", "rgb(0, 229, 255)")
                .attr("opacity", 0.8);

            // Barras female
            g.selectAll(".female")
                .data(salaryGap)
                .join("rect")
                .attr("class", "female")
                .attr("x", d => x(d.male))
                .attr("y", d => y(d.country))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.female))
                .attr("fill", "rgb(255, 107, 180)")
                .attr("opacity", 0.8);

            // Texto Pay Gap
            g.selectAll(".gap")
                .data(salaryGap)
                .join("text")
                .attr("class", "gap")
                .attr("x", innerW + 6)
                .attr("y", d => y(d.country) + y.bandwidth() / 2 + 3)
                .attr("fill", "rgb(192,192,216)")
                .attr("font-size", "10px")
                .text(d => `${d.gender_pay_gap}%`);

            // Tooltip
            g.selectAll("rect")
                .on("mouseover", (e, d) => showTip(
                    `<b>${d.country}</b><br>
                    Hombres: <b>${((d.male / (d.male + d.female)) * 100).toFixed(1)}%</b>
                    Mujeres: <b>${((d.female / (d.male + d.female)) * 100).toFixed(1)}%</b>
                    Pay Gap: <b>${d.gender_pay_gap}%</b>`,
                    e
                ))
                .on("mousemove", moveTip)
                .on("mouseleave", hideTip);
        })();
    
    // P5
    drawWordCloud(words);
    hBar("bar-words", words.slice(0, 20).reverse(), "count", "word", COLORS);
}

main().catch(console.error);