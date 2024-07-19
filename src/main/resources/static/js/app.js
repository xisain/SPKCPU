import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc , Timestamp} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { firebaseConfig } from "./key.js"

 
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
        const cpuName = row.insertCell(0);
        const releaseDate = row.insertCell(1);
        const socketType = row.insertCell(2);
        const ramSupport = row.insertCell(3);
        const core = row.insertCell(4);

        cpuName.innerHTML = cpuData.vendor + " " + cpuData.name;
        releaseDate.innerHTML = cpuData.releasedYear;
        socketType.innerHTML = cpuData.socket;
        ramSupport.innerHTML = cpuData.supportedramtype;
        core.innerHTML = cpuData.core;
    });

    function filterData() {
        cpuTableBody.innerHTML = "";

        const selectedVendors = Array.from(document.querySelectorAll('input[name="vendor"]:checked')).map(cb => cb.value);
        const selectedSockets = Array.from(document.querySelectorAll('input[name="socket"]:checked')).map(cb => cb.value);
        const selectedRamSupports = Array.from(document.querySelectorAll('input[name="ram"]:checked')).map(cb => cb.value);

        const filteredData = cpuDataList.filter(cpu => {
            const matchesVendor = selectedVendors.length === 0 || selectedVendors.includes(cpu.vendor);
            const matchesSocket = selectedSockets.length === 0 || selectedSockets.includes(cpu.socket);
            const matchesRamSupport = selectedRamSupports.length === 0 || selectedRamSupports.includes(cpu.supportedramtype);

            return matchesVendor && matchesSocket && matchesRamSupport
        });

        filteredData.forEach(cpuData => {
            const row = cpuTableBody.insertRow();
            const cpuName = row.insertCell(0);
            const releaseDate = row.insertCell(1);
            const socketType = row.insertCell(2);
            const ramSupport = row.insertCell(3);
            const core = row.insertCell(4);

            cpuName.innerHTML = cpuData.vendor + " " + cpuData.name;
            releaseDate.innerHTML = cpuData.releasedYear;
            socketType.innerHTML = cpuData.socket;
            ramSupport.innerHTML = cpuData.supportedramtype;
            core.innerHTML = cpuData.core;
        });
    }

    document.querySelectorAll('input[name="vendor"]').forEach(cb => cb.addEventListener('change', filterData));
    document.querySelectorAll('input[name="socket"]').forEach(cb => cb.addEventListener('change', filterData));
    document.querySelectorAll('input[name="ram"]').forEach(cb => cb.addEventListener('change', filterData));
});
