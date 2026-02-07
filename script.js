// 1. البيانات والتخزين
let subscriptions = JSON.parse(localStorage.getItem('subs')) || [];
let archived = JSON.parse(localStorage.getItem('archived')) || [];
let currentCurrency = localStorage.getItem('userCurrency') || 'DZD';
let exchangeRates = { DZD: 134.50, SAR: 3.75, USD: 1, EUR: 0.92 }; // قيم افتراضية
let isSidebarOpen = true;

const servicePresets = [
    { name: 'Netflix', domain: 'netflix.com', price: 15.99 },
    { name: 'Spotify', domain: 'spotify.com', price: 9.99 },
    { name: 'YouTube', domain: 'youtube.com', price: 11.99 },
    { name: 'ChatGPT', domain: 'openai.com', price: 20.00 },
    { name: 'Disney+', domain: 'disneyplus.com', price: 7.99 },
    { name: 'Amazon', domain: 'amazon.com', price: 14.99 }
];

// 2. ميزة فتح وإغلاق القائمة
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('toggleIcon');
    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
        sidebar.classList.replace('sidebar-closed', 'sidebar-open');
        icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
    } else {
        sidebar.classList.replace('sidebar-open', 'sidebar-closed');
        icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
    }
}

// 3. جلب أسعار الصرف الحية
async function fetchRates() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
            exchangeRates = data.rates;
            render();
        }
    } catch (e) { console.warn("Using default rates"); }
}

// 4. تغيير العملة
function changeCurrency(val) {
    currentCurrency = val;
    localStorage.setItem('userCurrency', val);
    render();
}

// 5. التنقل بين التبويبات
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'text-white'));
    
    document.getElementById(tabName).classList.remove('hidden');
    event.currentTarget.classList.add('active-tab');
    
    const titles = { dashboard: 'الرئيسية', subs: 'إدارة الاشتراكات', cemetery: 'سجل التوفير', settings: 'الإعدادات' };
    document.getElementById('tabTitle').innerText = titles[tabName];
    render();
}

// 6. الوظائف الأساسية
function addPreset(index) {
    const s = servicePresets[index];
    subscriptions.push({
        id: Date.now(),
        name: s.name,
        price: s.price,
        icon: `https://www.google.com/s2/favicons?sz=128&domain=${s.domain}`
    });
    save();
}

function customAdd() {
    const name = prompt("اسم الخدمة:");
    const price = parseFloat(prompt("السعر بالدولار ($):"));
    if (name && !isNaN(price)) {
        subscriptions.push({ id: Date.now(), name, price, icon: `https://ui-avatars.com/api/?name=${name}&background=4f46e5&color=fff` });
        save();
    }
}

function moveToCemetery(id) {
    const idx = subscriptions.findIndex(s => s.id === id);
    archived.push(subscriptions.splice(idx, 1)[0]);
    save();
}

function exportToCSV() {
    let csv = "\ufeffالخدمة,السعر (USD),الحالة\n";
    subscriptions.forEach(s => csv += `${s.name},${s.price},نشط\n`);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    window.open(URL.createObjectURL(blob));
}

function clearAllData() {
    if(confirm("هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع!")) {
        localStorage.clear();
        location.reload();
    }
}

function save() {
    localStorage.setItem('subs', JSON.stringify(subscriptions));
    localStorage.setItem('archived', JSON.stringify(archived));
    render();
}

// 7. الرندرة (Render)
function render() {
    const rate = exchangeRates[currentCurrency] || 1;
    const symbol = currentCurrency;

    // تحديث القائمة النشطة
    document.getElementById('subsList').innerHTML = subscriptions.map(sub => `
        <div class="bg-[#1e293b] p-6 rounded-[2rem] flex justify-between items-center border border-slate-700 shadow-lg">
            <div class="flex items-center gap-5">
                <img src="${sub.icon}" class="w-12 h-12 rounded-xl bg-slate-800">
                <div>
                    <h4 class="font-bold text-lg text-white">${sub.name}</h4>
                    <p class="text-indigo-400 text-sm font-bold">${(sub.price * rate).toLocaleString()} ${symbol}</p>
                </div>
            </div>
            <button onclick="moveToCemetery(${sub.id})" class="text-slate-500 hover:text-red-400 p-2 transition"><i class="fas fa-archive"></i></button>
        </div>
    `).join('');

    // تحديث Presets
    document.getElementById('presets').innerHTML = servicePresets.map((s, i) => `
        <button onclick="addPreset(${i})" class="flex flex-col items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all">
            <img src="https://www.google.com/s2/favicons?sz=64&domain=${s.domain}" class="w-8 h-8 mb-2">
            <span class="text-[10px] font-bold text-slate-400">${s.name}</span>
        </button>
    `).join('');

    // تحديث الأرقام الرئيسية
    const totalUSD = subscriptions.reduce((a, b) => a + b.price, 0);
    document.getElementById('totalMonthly').innerText = `${(totalUSD * rate).toLocaleString()} ${symbol}`;
    
    const savedUSD = archived.reduce((a, b) => a + b.price, 0);
    document.getElementById('totalSaved').innerText = `${savedUSD.toFixed(2)} $`;

    // تحديث سجل التوفير
    document.getElementById('archivedList').innerHTML = archived.map(s => `
        <div class="p-4 bg-slate-800/50 rounded-2xl flex justify-between border border-slate-700/50 italic text-slate-500">
            <span>${s.name}</span> <span>+$${s.price}</span>
        </div>
    `).join('');
    
    document.getElementById('currencySelect').value = currentCurrency;
}

window.onload = () => {
    fetchRates();
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' });
    render();
};
