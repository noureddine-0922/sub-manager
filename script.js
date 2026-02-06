// البيانات الأساسية (سيتم حفظها في LocalStorage)
let subscriptions = JSON.parse(localStorage.getItem('subs')) || [];
let archived = JSON.parse(localStorage.getItem('archived')) || [];
const SAR_RATE = 3.75; // يمكنك ربطها بـ API لاحقاً

// التنقل بين التبويبات
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active-tab'));
    
    document.getElementById(tabName).classList.remove('hidden');
    event.currentTarget.classList.add('active-tab');
    render();
}

// إضافة اشتراك (بسيط للتجربة)
function addNewSubPrompt() {
    const name = prompt("اسم الخدمة (مثل Netflix):");
    const price = parseFloat(prompt("السعر بالدولار:"));
    if (name && price) {
        subscriptions.push({ id: Date.now(), name, price });
        saveData();
        render();
    }
}

// نقل الاشتراك للمقبرة
function moveToCemetery(id) {
    const index = subscriptions.findIndex(s => s.id === id);
    const sub = subscriptions.splice(index, 1)[0];
    archived.push(sub);
    saveData();
    render();
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('subs', JSON.stringify(subscriptions));
    localStorage.setItem('archived', JSON.stringify(archived));
}

// تحديث الواجهة
function render() {
    const subsList = document.getElementById('subsList');
    const archivedList = document.getElementById('archivedList');
    const totalMonthly = document.getElementById('totalMonthly');
    const totalSaved = document.getElementById('totalSaved');

    // عرض الاشتراكات النشطة
    subsList.innerHTML = subscriptions.map(sub => `
        <div class="bg-slate-800 p-4 rounded-2xl flex justify-between items-center border border-slate-700">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">${sub.name[0]}</div>
                <div>
                    <h4 class="font-bold">${sub.name}</h4>
                    <p class="text-xs text-slate-400 font-mono">$${sub.price}</p>
                </div>
            </div>
            <button onclick="moveToCemetery(${sub.id})" class="text-slate-500 hover:text-red-400">إلغاء</button>
        </div>
    `).join('');

    // عرض المقبرة
    archivedList.innerHTML = archived.map(sub => `
        <div class="bg-slate-800 p-4 rounded-2xl flex justify-between items-center border border-red-900/30">
            <span>${sub.name}</span>
            <span class="text-xs">تم التوفير 🎉</span>
        </div>
    `).join('');

    // حسابات المبالغ
    const totalUSD = subscriptions.reduce((sum, s) => sum + s.price, 0);
    totalMonthly.innerText = `${(totalUSD * SAR_RATE).toFixed(2)} ريال`;
    
    const savedUSD = archived.reduce((sum, s) => sum + s.price, 0);
    totalSaved.innerText = `${savedUSD.toFixed(2)} $`;

    checkSmartInsights();
}

// التوفير الذكي
function checkSmartInsights() {
    const alertBox = document.getElementById('smartAlert');
    const msg = document.getElementById('alertMessage');
    
    if (subscriptions.length > 3) {
        alertBox.classList.remove('hidden');
        msg.innerText = "لديك أكثر من 3 اشتراكات نشطة، راجع قائمة 'المقبرة' لترى كم وفرت بإلغاء ما لا تحتاجه.";
    } else {
        alertBox.classList.add('hidden');
    }
}

// تشغيل عند التحميل
document.getElementById('currentDate').innerText = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
render();
