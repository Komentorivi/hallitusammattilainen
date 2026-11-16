// Yhteyslomake. Jos lomakepalvelun osoite (data-endpoint) on asetettu, viesti lähetetään sinne.
// Muuten avataan sähköpostiohjelma valmiilla viestillä.
(function () {
  var form = document.getElementById('lomake');
  if (!form) return;
  var tila = document.getElementById('tila');
  var TO = 'mikko.kauppinen@hallitusammattilainen.fi';

  function show(text, ok) {
    tila.textContent = text;
    tila.className = 'msg ' + (ok ? 'ok' : 'err');
    tila.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var puuttuu = [];
    ['nimi', 'email', 'viesti'].forEach(function (id) {
      var el = document.getElementById(id);
      var bad = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) puuttuu.push(el.previousSibling ? el.previousSibling.textContent.trim() : id);
    });
    var soitto = document.getElementById('soitto'), puh = document.getElementById('puhelin');
    var puhPuuttuu = soitto && soitto.checked && !puh.value.trim();
    puh.setAttribute('aria-invalid', puhPuuttuu ? 'true' : 'false');
    if (puhPuuttuu) puuttuu.push('Puhelinnumero soittopyyntöä varten');
    if (puuttuu.length) {
      show('Täytä vielä: ' + puuttuu.join(', ').toLowerCase() + '.', false);
      return;
    }
    var data = new FormData(form);
    if (data.get('_gotcha')) return;
    var endpoint = form.getAttribute('data-endpoint');
    var btn = form.querySelector('button[type=submit]');
    var otsikko = (data.get('soittopyynto') ? 'SOITTOPYYNTÖ – ' : 'Tarjouspyyntö: ') + data.get('rooli');

    if (!endpoint) {
      var body = 'Nimi: ' + data.get('nimi') + '\nSähköposti: ' + data.get('email') +
        '\nPuhelin: ' + (data.get('puhelin') || '-') + '\nTaloyhtiö: ' + (data.get('taloyhtio') || '-') +
        '\nTarve: ' + data.get('rooli') + '\nSoittopyyntö: ' + (data.get('soittopyynto') ? 'kyllä' : 'ei') + '\n\n' + data.get('viesti');
      location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(otsikko) +
        '&body=' + encodeURIComponent(body);
      show('Sähköpostiohjelmasi avautui valmiilla viestillä. Paina siellä Lähetä. Jos mitään ei avautunut, kirjoita osoitteeseen ' + TO + '.', true);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Lähetetään…';
    data.append('_subject', otsikko);
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        show('Kiitos! Viesti on perillä, ja palaan asiaan mahdollisimman pian.', true);
      })
      .catch(function () {
        show('Viesti ei lähtenyt. Kokeile uudelleen tai kirjoita suoraan osoitteeseen ' + TO + '.', false);
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = 'Lähetä viesti';
      });
  });
})();
