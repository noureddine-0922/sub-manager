// 1. البيانات والإعدادات
let subscriptions = JSON.parse(localStorage.getItem('subs')) || [];
let archived = JSON.parse(localStorage.getItem('archived')) || [];
let exchangeRate = 3.75;

// قائمة الخدمات الجاهزة (Presets)
const servicePresets = [
    { name: 'Netflix', domain: 'netflix.com', price: 15.99 },
    { name: 'Spotify', domain: 'spotify.com', price: 9.99 },
    { name: 'YouTube', domain: 'youtube.com', price: 11.99 },
    { name: 'ChatGPT', domain: 'openai.com', price: 20.00 },
    { name: 'Amazon', domain: 'amazon.com', price: 14.99 },
    { name: 'Disney+', domain: 'disneyplus.com', price: 7.99 }
];

// 2. جلب سعر الصرف
async function fetchExchangeRate() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates.SAR) {
            exchangeRate = data.rates.SAR;
            document.getElementById('exchangeRateBadge').innerText = `1$ = ${exchangeRate.toFixed(2)} SAR (تحديث مباشر)`;
            render();
        }
    } catch (e) { console.warn("Using fallback rate"); }
}

// 3. التنقل بين التبويبات
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab', 'bg-slate-700', 'text-white'));
    
    document.getElementById(tabName).classList.remove('hidden');
    event.currentTarget.classList.add('active-tab', 'bg-indigo-600', 'text-white');
    
    const titles = { dashboard: 'الرئيسية', subs: 'إدارة الاشتراكات', cemetery: 'المقبرة', privacy: 'الخصوصية' };
    document.getElementById('tabTitle').innerText = titles[tabName];
    render();
}

// 4. إضافة اشتراك من القائمة الجاهزة
function addPreset(index) {
    const service = servicePresets[index];
    const newSub = {
        id: Date.now(),
        name: service.name,
        price: service.price,
        icon: `https://www.google.com/s2/favicons?sz=64&domain=${service.domain}`
    };
    subscriptions.push(newSub);
    saveAndRefresh();
}

// 5. تصدير البيانات إلى ملف CSV (Excel)
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,الخدمة,السعر بالدولار,الحالة\n";
    subscriptions.forEach(s => csvContent += `${s.name},${s.price},نشط\n`);
    archived.forEach(s => csvContent += `${s.name},${s.price},ملغى\n`);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscriptions_report.csv");
    document.body.appendChild(link);
    link.click();
}

function moveToCemetery(id) {
    const idx = subscriptions.findIndex(s => s.id === id);
    archived.push(subscriptions.splice(idx, 1)[0]);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('subs', JSON.stringify(subscriptions));
    localStorage.setItem('archived', JSON.stringify(archived));
    render();
}

// 6. التحديث البصري
function render() {
    const list = document.getElementById('subsList');
    list.innerHTML = subscriptions.map(sub => `
        <div class="bg-[#1e293b] p-5 rounded-2xl flex justify-between items-center border border-slate-700 hover:scale-[1.01] transition-all">
            <div class="flex items-center gap-4">
                <img src="${sub.icon || 'https://ui-avatars.com/api/?name='+sub.name}" class="w-12 h-12 rounded-xl shadow-lg">
                <div>
                    <h4 class="font-bold text-lg">${sub.name}</h4>
                    <p class="text-xs text-slate-400">$${sub.price} <span class="text-indigo-400">≈ ${(sub.price * exchangeRate).toFixed(2)} ريال</span></p>
                </div>
            </div>
            <button onclick="moveToCemetery(${sub.id})" class="text-slate-500 hover:text-red-400 p-2"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    const presetsDiv = document.getElementById('presets');
    presetsDiv.innerHTML = servicePresets.map((s, i) => `
        <button onclick="addPreset(${i})" class="flex flex-col items-center p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <img src="https://www.google.com/s2/favicons?sz=64&domain=${s.domain}" class="w-8 h-8 mb-2">
            <span class="text-[10px] font-bold">${s.name}</span>
        </button>
    `).join('');

    const totalUSD = subscriptions.reduce((a, b) => a + b.price, 0);
    document.getElementById('totalMonthly').innerText = `${(totalUSD * exchangeRate).toFixed(2)} ريال`;
    
    const savedUSD = archived.reduce((a, b) => a + b.price, 0);
    document.getElementById('totalSaved').innerText = `${savedUSD.toFixed(2)} $`;
    
    document.getElementById('archivedList').innerHTML = archived.map(s => `<div class="p-2 border-b border-slate-800 text-slate-500">${s.name} - $${s.price}</div>`).join('');
}

window.onload = () => {
    fetchExchangeRate();
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-SA', {weekday: 'long', day: 'numeric', month: 'long'});
    render();
};
