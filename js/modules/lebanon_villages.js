/**
 * Lebanon Villages & Governorates Dynamic Cascade Selector Engine
 * Powered by LebanonVillage.json dataset
 * Southern Olive & Oil Products SARL (منتوجات زيت وزيتون الجنوب ش.م.م)
 */

window.LebanonLocations = {
  data: null,

  async init() {
    try {
      const res = await fetch('assets/data/LebanonVillage.json');
      if (res.ok) {
        this.data = await res.json();
        console.log('✅ Lebanon Villages dataset loaded successfully!');
        this.populateAllLocationSelects();
      }
    } catch (e) {
      console.warn('LebanonVillage.json fetch error:', e);
    }
  },

  getGovernorates() {
    if (!this.data) return [];
    const root = this.data["لبنان / Lebanon / Liban"];
    if (!root || !root["محافظات / Governorates / Gouvernorats"]) return [];
    return root["محافظات / Governorates / Gouvernorats"].map(gov => ({
      ar: gov["اسم_المحافظة"]["عربي"],
      en: gov["اسم_المحافظة"]["إنجليزي"],
      districts: gov["الأقضية"] || []
    }));
  },

  getDistricts(govAr) {
    const govs = this.getGovernorates();
    const target = govs.find(g => g.ar === govAr || g.en === govAr);
    if (!target) return [];
    return target.districts.map(d => ({
      ar: d["اسم_القضاء"]["عربي"],
      en: d["اسم_القضاء"]["إنجليزي"],
      towns: d["البلدات_والأحياء"] || []
    }));
  },

  getTowns(govAr, distAr) {
    const dists = this.getDistricts(govAr);
    const target = dists.find(d => d.ar === distAr || d.en === distAr);
    if (!target) return [];
    return target.towns.map(t => ({
      ar: t["عربي"],
      en: t["إنجليزي"],
      fr: t["فرنسي"]
    }));
  },

  populateAllLocationSelects() {
    const govSelects = document.querySelectorAll('.lebanon-gov-select');
    const govs = this.getGovernorates();
    govSelects.forEach(sel => {
      sel.innerHTML = '<option value="">-- اختر المحافظة --</option>';
      govs.forEach(g => {
        sel.innerHTML += `<option value="${g.ar}">${g.ar} (${g.en})</option>`;
      });

      sel.addEventListener('change', (e) => {
        const govVal = e.target.value;
        const parentRow = sel.closest('.lebanon-cascade-container') || document;
        const distSelect = parentRow.querySelector('.lebanon-dist-select');
        const townSelect = parentRow.querySelector('.lebanon-town-select');

        if (distSelect) {
          distSelect.innerHTML = '<option value="">-- اختر القضاء --</option>';
          const dists = this.getDistricts(govVal);
          dists.forEach(d => {
            distSelect.innerHTML += `<option value="${d.ar}">${d.ar} (${d.en})</option>`;
          });
        }
        if (townSelect) {
          townSelect.innerHTML = '<option value="">-- اختر البلدة / الحي --</option>';
        }
      });
    });

    document.querySelectorAll('.lebanon-dist-select').forEach(distSel => {
      distSel.addEventListener('change', (e) => {
        const distVal = e.target.value;
        const parentRow = distSel.closest('.lebanon-cascade-container') || document;
        const govSelect = parentRow.querySelector('.lebanon-gov-select');
        const townSelect = parentRow.querySelector('.lebanon-town-select');
        const govVal = govSelect ? govSelect.value : '';

        if (townSelect) {
          townSelect.innerHTML = '<option value="">-- اختر البلدة / الحي --</option>';
          const towns = this.getTowns(govVal, distVal);
          towns.forEach(t => {
            townSelect.innerHTML += `<option value="${t.ar}">${t.ar} (${t.en})</option>`;
          });
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.LebanonLocations.init();
});
