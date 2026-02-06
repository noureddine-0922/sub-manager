/**
 * Sub Manager Pro - Logic v2.0
 * ميزات: جلب عملات، توفير ذكي، أرشفة، تخزين محلي
 */

// 1. تعريف المتغيرات والبيانات
let subscriptions = JSON.parse(localStorage.getItem('subs')) || [];
let archived = JSON.parse(localStorage.getItem('archived')) || [];
let exchangeRate = 3.75; // سعر افتراضي للريال السعودي

// 2. جلب سعر الصرف من API خارجي
async function fetchExchangeRate() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.SAR) {
            exchangeRate = data.rates.SAR;
            console.log("تم تحديث سعر الصرف بنجاح");
            render(); 
        }
    } catch (error) {
        console.warn("فشل الاتصال بالـ API، تم استخدام السعر الافتراضي");
    }
}

// 3. التنقل بين التبويبات (Tabs)
function openTab(tabName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // إزالة التنسيق النشط من الأزرار
    document.querySelectorAll('.tab-link').forEach(link => {
        link.classList.remove('active-tab');
    });

    // إظهار القسم المختار وتنشيط الزر
    document.getElementById(tabName).classList.remove('hidden');
    event.currentTarget.classList.add('active-tab');
    
    render(); // إعادة التحديث عند التنقل
}

// 4. إضافة اشتراك جديد
function addNewSubPrompt() {
    const name = prompt("أدخل اسم الخدمة (مثلاً: Netflix):");
    if (!name) return;

    const price = parseFloat(prompt("أدخل السعر بالدولار ($):"));
    if (isNaN(price)) {
        alert("يرجى إدخال رقم صحيح للسعر");
        return;
    }

    const newSub = {
        id: Date.now(),
        name: name,
        price: price,
        date: new Date().toLocaleDateString('ar-SA')
    };

    subscriptions.push(newSub);
    saveAndRefresh();
}

// 5. نقل الاشتراك للمقبرة (إلغاء)
function moveToCemetery(id) {
    const index = subscriptions.findIndex(s => s.id === id);
    if (index !== -1) {
        const sub = subscriptions.splice(index, 1)[0];
        archived.push(sub);
        saveAndRefresh();
        alert(`تم نقل ${sub.name} إلى المقبرة. وداعاً للتبذير! ⚰️`);
    }
}

// 6. حفظ البيانات وتحديث الواجهة
function saveAndRefresh() {
    localStorage.setItem('subs', JSON.stringify(subscriptions));
    localStorage.setItem('archived', JSON.stringify(archived));
    render();
}

// 7. تحديث واجهة المستخدم (The Core Render Function)
function render() {
    const subsList = document.getElementById('subsList');
    const archivedList = document.getElementById('archivedList');
    const totalMonthlyDisplay = document.getElementById('totalMonthly');
    const totalSavedDisplay = document.getElementById('totalSaved');

    // أ- عرض الاشتراكات النشطة
    subsList.innerHTML = subscriptions.length === 0 
        ? '<p class="text-center text-slate-500 py-10">لا توجد اشتراكات نشطة حالياً</p>' 
        : subscriptions.map(sub => `
        <div class="bg-slate-800 p-4 rounded-2xl flex justify-between items-center border border-slate-700 hover:border-indigo-500 transition-all shadow-lg">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-inner">
                    ${sub.name[0].toUpperCase()}
                </div>
                <div>
                    <h4 class="font-bold text-slate-100">${sub.name}</h4>
                    <p class="text-xs text-slate-400">
                        $${sub.price.toFixed(2)} 
                        <span class="text-indigo-400 mr-2 font-mono">≈ ${(sub.price * exchangeRate).toFixed(2)} ريال</span>
                    </p>
                </div>
            </div>
            <button onclick="moveToCemetery(${sub.id})" class="text-slate-500 hover:text-red-400 p-2 transition">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');

    // ب- عرض المقبرة (الأرشيف)
    archivedList.innerHTML = archived.length === 0
        ? '<p class="text-center text-slate-600 py-4 italic">المقبرة فارغة.. يبدو أنك كريم جداً!</p>'
        : archived.map(sub => `
        <div class="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center border border-red-900/10 mb-2">
            <span class="text-slate-400 font-medium">${sub.name}</span>
            <span class="text-[10px] bg-red-900/20 text-red-400 px-3 py-1 rounded-full border border-red-900/30">
                وفرت $${sub.price}
            </span>
        </div>
    `).join('');

    // ج- حساب الإجماليات
    const totalUSD = subscriptions.reduce((sum, s) => sum + s.price, 0);
    totalMonthlyDisplay.innerText = `${(totalUSD * exchangeRate).toFixed(2)} ريال`;
    
    const savedUSD = archived.reduce((sum, s) => sum + s.price, 0);
    totalSavedDisplay.innerText = `${savedUSD.toFixed(2)} $`;

    checkSmartInsights();
}

// 8. منطق التوفير الذكي (Smart Insights)
function checkSmartInsights() {
    const alertBox = document.getElementById('smartAlert');
    const msg = document.getElementById('alertMessage');
    
    // مثال بسيط: إذا زاد المبلغ عن 150 ريال شهرياً
    const totalSAR = subscriptions.reduce((sum, s) => sum + (s.price * exchangeRate), 0);
    
    if (totalSAR > 150) {
        alertBox.classList.remove('hidden');
        msg.innerText = `مصاريفك تجاوزت 150 ريال. هل راجعت اشتراكاتك مؤخراً؟`;
    } else if (subscriptions.length > 3) {
        alertBox.classList.remove('hidden');
        msg.innerText = `لديك ${subscriptions.length} اشتراكات. تأكد من أنك تستخدمها جميعاً بانتظام.`;
    } else {
        alertBox.classList.add('hidden');
    }
}

// 9. تشغيل عند تحميل الصفحة
window.onload = () => {
    fetchExchangeRate(); // جلب سعر الصرف فور التشغيل
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.innerText = new Date().toLocaleDateString('ar-SA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    render();
};
