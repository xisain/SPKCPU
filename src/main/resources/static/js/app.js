import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { firebaseConfig } from "./key.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const Firestore = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    const cpuTableBody = document.getElementById("cpuTableBody");
    const querySnapshot = await getDocs(collection(Firestore, "data"));
    const cpuDataList = [];

    querySnapshot.forEach((doc) => {
        const cpuData = doc.data();
        cpuDataList.push(cpuData);

        const row = cpuTableBody.insertRow();
        row.insertCell(0).innerHTML = cpuData.name;
        row.insertCell(1).innerHTML = cpuData.vendor;
        row.insertCell(2).innerHTML = cpuData.baseclock;
        row.insertCell(3).innerHTML = cpuData.boostclock;
        row.insertCell(4).innerHTML = cpuData.core;
        row.insertCell(5).innerHTML = cpuData.thread;
        row.insertCell(6).innerHTML = cpuData.cache;
        row.insertCell(7).innerHTML = cpuData.lithography;
        row.insertCell(8).innerHTML = cpuData.defaulttdp;
        row.insertCell(9).innerHTML = cpuData.loweredtdp;
        row.insertCell(10).innerHTML = cpuData.releasedYear;
        row.insertCell(11).innerHTML = cpuData.socket;
        row.insertCell(12).innerHTML = cpuData.supportedramtype;
        row.insertCell(13).innerHTML = cpuData.isintegratedgpuavailable;
        row.insertCell(14).innerHTML = ""; // Placeholder, to be filled after calculation
    });

// Populate dropdowns with unique values
function populateDropdown(dropdownId, dataKey) {
    const dropdown = document.getElementById(dropdownId);
    const uniqueValues = [...new Set(cpuDataList.map(cpu => cpu[dataKey]))];
    uniqueValues.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.text = value;
        dropdown.add(option);
    });
}

populateDropdown("vendorDropdown", "vendor");
populateDropdown("socketDropdown", "socket");
populateDropdown("supportedRAMTypeDropdown", "supportedramtype");

// Toggle the enabled/disabled state of the input fields
function toggleField(checkboxId, fieldId) {
    const checkbox = document.getElementById(checkboxId);
    const field = document.getElementById(fieldId);
    field.disabled = !checkbox.checked;
}

// Normalize function
function normalize(value, min, max) {
    return (value - min) / (max - min);
}

// Calculate AHP function
function calculateAHP() {
    const selectedCriteria = Array.from(document.querySelectorAll('input[name="criteria"]:checked'))
        .map(cb => cb.value)
        .filter(criteria => !['vendor', 'name', 'socket', 'supportedramtype'].includes(criteria));

    const weights = selectedCriteria.map(criteria => parseFloat(document.getElementById(`${criteria}Weight`).value));

    if (weights.some(isNaN)) {
        alert("Please enter valid weights for all selected criteria.");
        return;
    }

    const selectedVendor = document.getElementById("vendorCriteria").checked ? document.getElementById("vendorDropdown").value : null;
    const selectedSocket = document.getElementById("socketCriteria").checked ? document.getElementById("socketDropdown").value : null;
    const selectedSupportedRAMType = document.getElementById("supportedRAMTypeCriteria").checked ? document.getElementById("supportedRAMTypeDropdown").value : null;

    const filteredData = cpuDataList.filter(cpu =>
        (!selectedVendor || cpu.vendor === selectedVendor) &&
        (!selectedSocket || cpu.socket === selectedSocket) &&
        (!selectedSupportedRAMType || cpu.supportedramtype === selectedSupportedRAMType)
    );

    const criteriaType = {
        baseclock: 'maximize',
        boostclock: 'maximize',
        core: 'maximize',
        thread: 'maximize',
        cache: 'maximize',
        lithography: 'minimize',
        defaulttdp: 'minimize',
        loweredtdp: 'minimize',
        releasedYear: 'maximize',
        isintegratedgpuavailable: 'maximize'
    };

    const normalizedData = filteredData.map(cpu => {
        const normalizedCpu = { ...cpu };
        selectedCriteria.forEach(criteria => {
            const values = filteredData.map(cpu => parseFloat(cpu[criteria]));
            const min = Math.min(...values);
            const max = Math.max(...values);
            let value = parseFloat(cpu[criteria]);
            if (!isNaN(value)) {
                value = normalize(value, min, max);
                if (criteriaType[criteria] === 'minimize') {
                    value = 1 - value;
                }
            }
            normalizedCpu[criteria] = value;
        });
        return normalizedCpu;
    });

    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);

    const cpuScores = normalizedData.map(cpu => {
        let score = 0;
        selectedCriteria.forEach((criteria, index) => {
            score += cpu[criteria] * normalizedWeights[index];
        });
        return { cpu: filteredData.find(c => c.name === cpu.name), score };
    });

    cpuScores.sort((a, b) => b.score - a.score);

    cpuTableBody.innerHTML = "";
    cpuScores.forEach(({ cpu, score }) => {
        const row = cpuTableBody.insertRow();
        row.insertCell(0).innerHTML = cpu.name;
        row.insertCell(1).innerHTML = cpu.vendor;
        row.insertCell(2).innerHTML = cpu.baseclock;
        row.insertCell(3).innerHTML = cpu.boostclock;
        row.insertCell(4).innerHTML = cpu.core;
        row.insertCell(5).innerHTML = cpu.thread;
        row.insertCell(6).innerHTML = cpu.cache;
        row.insertCell(7).innerHTML = cpu.lithography;
        row.insertCell(8).innerHTML = cpu.defaulttdp;
        row.insertCell(9).innerHTML = cpu.loweredtdp;
        row.insertCell(10).innerHTML = cpu.releasedYear;
        row.insertCell(11).innerHTML = cpu.socket;
        row.insertCell(12).innerHTML = cpu.supportedramtype;
        row.insertCell(13).innerHTML = cpu.isintegratedgpuavailable;
        row.insertCell(14).innerHTML = score.toFixed(2);
    });
}

document.getElementById("calculateAHP").addEventListener("click", calculateAHP);

    function sortTable(columnIndex, ascending = true) {
        const rows = Array.from(cpuTableBody.rows);
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].innerText;
            const bText = b.cells[columnIndex].innerText;
            const aValue = isNaN(aText) ? aText : parseFloat(aText);
            const bValue = isNaN(bText) ? bText : parseFloat(bText);
            return (aValue > bValue ? 1 : -1) * (ascending ? 1 : -1);
        });
        cpuTableBody.innerHTML = "";
        rows.forEach(row => cpuTableBody.appendChild(row));
    }

    document.querySelectorAll('.criteria-column').forEach((header, index) => {
        header.style.cursor = "pointer";
        header.addEventListener("click", () => {
            const ascending = header.getAttribute("data-sort") !== "asc";
            sortTable(index, ascending);
            header.setAttribute("data-sort", ascending ? "asc" : "desc");
        });
    });
});
