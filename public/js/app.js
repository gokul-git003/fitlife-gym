// Utility to check authentication
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('gymUser'));
    if (!user || !user.role) {
        localStorage.removeItem('gymUser');
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
        return null;
    }
    if (requiredRole && user.role !== requiredRole) {
        localStorage.removeItem('gymUser');
        window.location.href = '/';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('gymUser');
    window.location.href = '/';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
    });
}

function showAlert(message, type = 'success', elementId = 'loginAlert') {
    const box = document.getElementById(elementId);
    if (!box) return;
    box.textContent = message;
    box.className = `alert alert-${type}`;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 4000);
}

// Modal handling
window.openModal = function(id) {
    document.getElementById(id).classList.add('active');
}
window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
}

// API request wrapper
async function apiRequest(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    } catch (error) {
        return { ok: false, status: 500, data: { error: 'Network error' } };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Global Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Tab Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // --- LOGIN ---
    if (path === '/' || path === '/index.html') {
        const user = JSON.parse(localStorage.getItem('gymUser'));
        if (user) {
            if (user.role === 'admin') window.location.href = '/admin.html';
            else if (user.role === 'trainer') window.location.href = '/trainer.html';
            else window.location.href = '/member.html';
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = e.target.username.value;
                const password = e.target.password.value;
                
                // Show loading state
                const btn = loginForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Authenticating...';
                btn.disabled = true;

                const { ok, data } = await apiRequest('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });

                // Reset state
                btn.innerHTML = originalText;
                btn.disabled = false;

                if (ok) {
                    localStorage.setItem('gymUser', JSON.stringify(data));
                    if (data.role === 'admin') window.location.href = '/admin.html';
                    else if (data.role === 'trainer') window.location.href = '/trainer.html';
                    else window.location.href = '/member.html';
                } else {
                    showAlert(data.error || 'Login failed', 'danger', 'loginAlert');
                }
            });
        }
    }

    // --- ADMIN ---
    if (path.includes('admin.html')) {
        const user = checkAuth('admin');
        if (!user) return;
        document.getElementById('adminName').textContent = user.name;
        
        loadAdminData();

        document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            const { ok, data } = await apiRequest('/api/members', { method: 'POST', body: JSON.stringify(formData) });
            if(ok) { closeModal('addMemberModal'); e.target.reset(); loadAdminData(); }
            else alert(data.error);
        });

        document.getElementById('addTrainerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            const { ok, data } = await apiRequest('/api/trainers', { method: 'POST', body: JSON.stringify(formData) });
            if(ok) { closeModal('addTrainerModal'); e.target.reset(); loadAdminData(); }
            else alert(data.error);
        });

        document.getElementById('addPlanForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            const { ok, data } = await apiRequest('/api/plans', { method: 'POST', body: JSON.stringify(formData) });
            if(ok) { closeModal('addPlanModal'); e.target.reset(); loadAdminData(); }
            else alert(data.error);
        });
    }

    // --- TRAINER ---
    if (path.includes('trainer.html')) {
        const user = checkAuth('trainer');
        if (!user) return;
        document.getElementById('trainerName').textContent = user.name;
        
        loadTrainerData(user);

        document.getElementById('assignWorkoutForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            formData.trainer_id = user.profileId;
            const { ok, data } = await apiRequest('/api/workouts', { method: 'POST', body: JSON.stringify(formData) });
            if(ok) { alert('Workout assigned'); e.target.reset(); }
        });

        document.getElementById('createClassForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            formData.trainer_id = user.profileId;
            const { ok, data } = await apiRequest('/api/classes', { method: 'POST', body: JSON.stringify(formData) });
            if(ok) { closeModal('createClassModal'); e.target.reset(); loadTrainerData(user); }
        });
    }

    // --- MEMBER ---
    if (path.includes('member.html')) {
        const user = checkAuth('member');
        if (!user) return;
        document.getElementById('memberName').textContent = user.name;
        
        loadMemberData(user);

        document.getElementById('paymentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target));
            formData.member_id = user.profileId;
            const { ok } = await apiRequest('/api/payments', { method: 'POST', body: JSON.stringify(formData) });
            if (ok) {
                // If it's a simulated renewal, let's just assign plan #1 for demo purposes
                await apiRequest('/api/memberships/assign', { method: 'POST', body: JSON.stringify({ member_id: user.profileId, plan_id: 1 }) });
                closeModal('paymentModal');
                e.target.reset();
                loadMemberData(user);
            }
        });
    }
});

// --- ADMIN DATA LOADER ---
async function loadAdminData() {
    const { data: dash } = await apiRequest('/api/reports/dashboard');
    if (dash) {
        document.getElementById('stat-total-members').textContent = dash.totalMembers;
        document.getElementById('stat-active-members').textContent = dash.activeMembers;
        document.getElementById('stat-revenue').textContent = `$${dash.totalRevenue.toFixed(2)}`;
    }

    const { data: members } = await apiRequest('/api/members');
    if (members) {
        const tbody = document.getElementById('membersTableBody');
        tbody.innerHTML = '';
        members.forEach(m => {
            const isExpired = !m.membership_status || m.membership_status !== 'active' || new Date(m.membership_end_date) < new Date();
            tbody.innerHTML += `
                <tr>
                    <td>#${m.id}</td>
                    <td>${m.name}<br><small class="text-muted">${m.username}</small></td>
                    <td><span class="badge ${isExpired ? 'badge-danger' : 'badge-success'}">${isExpired ? 'Expired/None' : 'Active'}</span></td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id})">Delete</button></td>
                </tr>
            `;
        });
    }

    const { data: trainers } = await apiRequest('/api/trainers');
    if (trainers) {
        const tbody = document.getElementById('trainersTableBody');
        tbody.innerHTML = '';
        trainers.forEach(t => {
            tbody.innerHTML += `<tr><td>${t.name}</td><td>${t.specialty}</td></tr>`;
        });
    }

    const { data: plans } = await apiRequest('/api/plans');
    if (plans) {
        const tbody = document.getElementById('plansTableBody');
        tbody.innerHTML = '';
        plans.forEach(p => {
            tbody.innerHTML += `<tr><td>${p.name}</td><td>${p.duration_days}</td><td>$${p.price.toFixed(2)}</td></tr>`;
        });
    }
    
    const { data: att } = await apiRequest('/api/attendance');
    if (att) {
        document.getElementById('attendanceTableBody').innerHTML = att.map(a => `<tr><td>${a.name}</td><td>${formatDate(a.check_in_time)}</td></tr>`).join('');
    }
    
    const { data: pay } = await apiRequest('/api/payments');
    if (pay) {
        document.getElementById('paymentsTableBody').innerHTML = pay.map(p => `<tr><td>${p.name}</td><td>$${p.amount.toFixed(2)}</td><td>${formatDate(p.date)}</td></tr>`).join('');
    }
}

window.deleteMember = async function(id) {
    if(confirm('Delete member completely?')) {
        await apiRequest(`/api/members/${id}`, { method: 'DELETE' });
        loadAdminData();
    }
}

// --- TRAINER DATA LOADER ---
async function loadTrainerData(user) {
    const { data: members } = await apiRequest('/api/members');
    if (members) {
        const tbody = document.getElementById('trainerMembersBody');
        const select = document.getElementById('workoutMemberSelect');
        tbody.innerHTML = '';
        select.innerHTML = '<option value="">-- Select Member --</option>';
        
        members.forEach(m => {
            tbody.innerHTML += `<tr><td>${m.name}</td><td>${m.email || 'N/A'}</td></tr>`;
            select.innerHTML += `<option value="${m.id}">${m.name}</option>`;
        });
    }

    const { data: classes } = await apiRequest('/api/classes');
    if (classes) {
        const myClasses = classes.filter(c => c.trainer_id === user.profileId);
        document.getElementById('trainerClassesBody').innerHTML = myClasses.map(c => `<tr><td>${c.name}</td><td>${c.schedule_time}</td><td>${c.capacity}</td></tr>`).join('');
    }
}

// --- MEMBER DATA LOADER ---
async function loadMemberData(user) {
    // Member details + status
    const { data: members } = await apiRequest('/api/members');
    const me = members.find(m => m.id === user.profileId);
    
    const statusEl = document.getElementById('memStatus');
    const expiryEl = document.getElementById('memExpiry');
    const notifArea = document.getElementById('notificationArea');
    notifArea.innerHTML = '';

    if (me && me.membership_status === 'active') {
        const exp = new Date(me.membership_end_date);
        const now = new Date();
        if (exp > now) {
            statusEl.textContent = 'Active';
            statusEl.className = 'badge badge-success';
            expiryEl.textContent = formatDate(me.membership_end_date);
            
            const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
            if (diffDays <= 5) {
                notifArea.innerHTML = `<div class="alert alert-error" style="display:block;">Your membership expires in ${diffDays} days! Please renew.</div>`;
            }
        } else {
            statusEl.textContent = 'Expired';
            statusEl.className = 'badge badge-danger';
            notifArea.innerHTML = `<div class="alert alert-error" style="display:block;">Your membership has expired! Please renew to access the gym.</div>`;
        }
    } else {
        statusEl.textContent = 'No Plan';
        statusEl.className = 'badge badge-warning';
    }

    const { data: att } = await apiRequest('/api/attendance');
    if (att) {
        const myAtt = att.filter(a => a.member_id === user.profileId);
        document.getElementById('memberAttendanceBody').innerHTML = myAtt.map(a => `<tr><td>${formatDate(a.check_in_time)}</td><td><span class="badge badge-success">Checked-In</span></td></tr>`).join('');
    }
    
    const { data: pay } = await apiRequest('/api/payments');
    if (pay) {
        const myPay = pay.filter(p => p.member_id === user.profileId);
        document.getElementById('memberPaymentsBody').innerHTML = myPay.map(p => `<tr><td>${formatDate(p.date)}</td><td>${p.description}</td><td>$${p.amount.toFixed(2)}</td></tr>`).join('');
    }

    const { data: classes } = await apiRequest('/api/classes');
    if (classes) {
        document.getElementById('memberClassesBody').innerHTML = classes.map(c => `
            <tr>
                <td>${c.name}</td><td>${c.trainer_name}</td><td>${c.schedule_time}</td>
                <td><button class="btn btn-outline btn-sm" onclick="bookClass(${c.id})">Book</button></td>
            </tr>
        `).join('');
    }

    const { data: workouts } = await apiRequest(`/api/workouts/${user.profileId}`);
    if (workouts) {
        document.getElementById('memberWorkoutsList').innerHTML = workouts.length ? workouts.map(w => `
            <div class="card" style="margin-bottom:16px;">
                <div class="card-header"><span class="card-title">${w.title}</span><span class="text-muted">by ${w.trainer_name}</span></div>
                <p style="white-space:pre-wrap;">${w.details}</p>
                <small class="text-muted" style="display:block; margin-top:12px;">Assigned: ${formatDate(w.date)}</small>
            </div>
        `).join('') : '<p class="text-muted">No workouts assigned yet.</p>';
    }
}

window.checkIn = async function() {
    const user = checkAuth('member');
    if(!user) return;
    const { ok, data } = await apiRequest('/api/checkin', { method: 'POST', body: JSON.stringify({ member_id: user.profileId }) });
    if(ok && data.status === 'success') {
        alert('Successfully checked in!');
        loadMemberData(user);
    } else {
        alert(`Check-in Denied: ${data.reason}`);
    }
}

window.bookClass = async function(class_id) {
    const user = checkAuth('member');
    if(!user) return;
    const { ok } = await apiRequest('/api/classes/book', { method: 'POST', body: JSON.stringify({ class_id, member_id: user.profileId }) });
    if(ok) alert('Class booked!');
}
