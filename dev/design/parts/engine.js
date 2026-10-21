  var I18N = {
    fr: {
      home: 'chez moi', standby: 'En attente',
      wx: { clear: 'Ciel dégagé', cloudy: 'Éclaircies', overcast: 'Ciel couvert', fog: 'Brouillard', rain: 'Pluie', snow: 'Neige', storm: 'Orage' },
      radius: function (r) { return 'rayon de ' + r; }, none: 'Aucun avion', quiet: "Le ciel est calme pour l'instant.",
      at: function (d, w) { return 'à ' + d + ' ' + w; },
      phase: { climb: 'En montée', descent: 'En descente', cruise: 'En croisière', level: 'En palier' },
      compass: ['au nord', 'au nord-est', "à l'est", 'au sud-est', 'au sud', 'au sud-ouest', "à l'ouest", 'au nord-ouest'],
      dir: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
      offlineTitle: 'Hors ligne', offlineMeta: 'Radar indisponible', noCoords: 'Renseignez la latitude et la longitude dans les réglages.',
      noFeed: 'Impossible de joindre adsb.fi pour le moment.', private: 'Vol privé', unknownAc: 'Appareil inconnu', noRoute: 'Itinéraire inconnu',
      thousands: ' ', decimal: ',',
      l: { flight: 'Vol', aircraft: 'Appareil', altitude: 'Altitude', speed: 'Vitesse', status: 'Statut', distance: 'Distance',
           from: 'De', to: 'Vers', reg: 'Immat.', above: 'Au-dessus de', updated: 'Mis à jour', weather: 'Météo', heading: 'Cap',
           airline: 'Compagnie', nearest: 'Le plus proche', overhead: 'Survol', now: 'Maintenant', radius: 'Rayon', upd: 'Màj' }
    },
    en: {
      home: 'home', standby: 'Standing by',
      wx: { clear: 'Clear sky', cloudy: 'Partly cloudy', overcast: 'Overcast', fog: 'Fog', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm' },
      radius: function (r) { return r + ' radius'; }, none: 'No planes', quiet: 'The sky is quiet for now.',
      at: function (d, w) { return d + ' ' + w; },
      phase: { climb: 'Climbing', descent: 'Descending', cruise: 'Cruising', level: 'Level flight' },
      compass: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'],
      dir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      offlineTitle: 'Offline', offlineMeta: 'Radar unavailable', noCoords: 'Set your latitude and longitude in the plugin settings.',
      noFeed: 'Unable to reach adsb.fi right now.', private: 'Private flight', unknownAc: 'Unknown aircraft', noRoute: 'Route unknown',
      thousands: ',', decimal: '.',
      l: { flight: 'Flight', aircraft: 'Aircraft', altitude: 'Altitude', speed: 'Speed', status: 'Status', distance: 'Distance',
           from: 'From', to: 'To', reg: 'Reg.', above: 'Above', updated: 'Updated', weather: 'Weather', heading: 'Heading',
           airline: 'Airline', nearest: 'Nearest', overhead: 'Overhead', now: 'Now', radius: 'Radius', upd: 'Upd.' }
    }
  };

  function rad(d) { return d * Math.PI / 180; }
  function distKm(a, b, c, d) {
    var x = Math.sin(rad(c - a) / 2), y = Math.sin(rad(d - b) / 2);
    var h = x * x + Math.cos(rad(a)) * Math.cos(rad(c)) * y * y;
    return 12742 * Math.asin(Math.sqrt(h));
  }
  function bearing(a, b, c, d) {
    var y = Math.sin(rad(d - b)) * Math.cos(rad(c));
    var x = Math.cos(rad(a)) * Math.sin(rad(c)) - Math.sin(rad(a)) * Math.cos(rad(c)) * Math.cos(rad(d - b));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function sunElevation(lat, lon, date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 1);
    var doy = Math.floor((date - start) / 864e5) + 1, hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    var g = 2 * Math.PI / 365 * (doy - 1 + (hour - 12) / 24);
    var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g)
      + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
      - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var ha = rad((hour * 60 + eqt + 4 * lon) / 4 - 180), la = rad(lat);
    var cz = Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(ha);
    return 90 - Math.acos(Math.max(-1, Math.min(1, cz))) * 180 / Math.PI;
  }
  function fmt(n, t, digits) {
    var parts = n.toFixed(digits || 0).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, t.thousands) + (parts[1] ? t.decimal + parts[1] : '');
  }
  function titleCase(s) { return s.toLowerCase().replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
  function isAirliner(a) { return /^[A-Z]{3}\d/.test(a.cs) && /^A[2-5]$/.test(a.category || 'A3'); }
  function getJSON(url, ms) {
    return Promise.race([
      fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      new Promise(function (res) { setTimeout(function () { res(null); }, ms); })
    ]);
  }
  // Réduit la police d'un élément .fp-fit jusqu'à ce que son texte tienne sur une ligne
  function fit(el) {
    el.style.fontSize = '';
    var size = parseFloat(getComputedStyle(el).fontSize), min = size * 0.35;
    while (el.scrollWidth > el.clientWidth + 1 && size > min) { size *= 0.94; el.style.fontSize = size + 'px'; }
  }

  // La mise en page lit les données via des attributs : data-f="champ" (valeur), data-l="clé" (libellé traduit)
  function render(root) {
    root.setAttribute('data-done', '1');
    var q = function (s) { return root.querySelector(s); };
    var set = function (f, v) { root.querySelectorAll('[data-f="' + f + '"]').forEach(function (el) { el.textContent = v == null ? '' : v; }); };
    var fitAll = function () { root.querySelectorAll('.fp-fit').forEach(fit); };
    var t = I18N[root.dataset.lang] || I18N.en, fr = t === I18N.fr, imperial = root.dataset.units === 'imperial';
    var lat = parseFloat(root.dataset.lat), lon = parseFloat(root.dataset.lon);
    var radius = parseFloat(root.dataset.radius) || 25, prefer = root.dataset.prefer !== 'no';
    var ts = parseInt(root.dataset.ts, 10) || Math.floor(Date.now() / 1000), off = parseInt(root.dataset.off, 10) || 0;
    var now = new Date(ts * 1000);
    var unit = imperial ? ' mi' : ' km';
    var dist = function (km, digits) { return fmt(imperial ? km / 1.609 : km, t, digits) + unit; };
    var sector = function (a) { return Math.floor((bearing(lat, lon, a.lat, a.lon) + 22.5) / 45) % 8; };
    var city = function (name) { if (!name) return ''; name = name.split(',').pop().trim(); return fr ? (CITY_FR[name] || name) : name; };

    root.querySelectorAll('[data-l]').forEach(function (el) { el.textContent = t.l[el.dataset.l] || ''; });
    var cityEl = q('[data-f="city"]');
    set('city', cityEl && cityEl.textContent.trim() ? cityEl.textContent.trim() : t.home);
    set('time', new Date((ts + off) * 1000).toISOString().substr(11, 5));
    set('standby', t.standby);
    set('radius', fmt(radius, t) + unit);
    var color = root.classList.contains('fp--color');
    var elev = isNaN(lat) ? 30 : sunElevation(lat, lon, now);
    root.classList.add(elev > 6 ? 'fp--day' : elev > -6 ? 'fp--dusk' : 'fp--night');
    var wx = null;
    try { wx = JSON.parse(q('.fp-wx-data').textContent); } catch (e) {}
    var code = wx && wx.weather_code != null ? wx.weather_code : 0, sky = 'clear';
    if (code === 2) sky = 'cloudy';
    else if (code === 3) sky = 'overcast';
    else if (code === 45 || code === 48) sky = 'fog';
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) sky = 'rain';
    else if ((code >= 71 && code <= 77) || code === 85 || code === 86) sky = 'snow';
    else if (code >= 95) sky = 'storm';
    root.classList.add('fp--wx-' + sky);
    var temp = wx && wx.temperature_2m != null
      ? Math.round(imperial ? wx.temperature_2m * 9 / 5 + 32 : wx.temperature_2m) + (imperial ? ' °F' : ' °C') : '';
    set('wx', t.wx[sky]);
    set('temp', temp);
    set('wxFull', t.wx[sky] + (temp ? ' · ' + temp : ''));
    if (sky !== 'clear' && sky !== 'cloudy') root.classList.add('fp--grey');
    if (sky === 'rain' || sky === 'storm') precipitation(root, 'rain', sky === 'storm' ? 1.4 : 1);
    if (sky === 'snow') precipitation(root, 'snow', 1);

    var raw = null;
    try { raw = JSON.parse(q('.fp-data').textContent); } catch (e) {}
    if (isNaN(lat) || isNaN(lon) || !Array.isArray(raw)) {
      root.classList.add('fp--error');
      set('errTitle', t.offlineTitle);
      set('errMeta', t.offlineMeta);
      set('errMsg', isNaN(lat) ? t.noCoords : t.noFeed);
      return fitAll();
    }

    var planes = raw.filter(function (a) { return a.lat != null && a.alt_baro !== 'ground' && a.alt_baro != null; })
      .map(function (a) { a.cs = (a.flight || '').trim(); a.km = distKm(lat, lon, a.lat, a.lon); return a; })
      .sort(function (a, b) { return a.km - b.km; });
    var radiusKm = imperial ? radius * 1.609 : radius;
    var inside = planes.filter(function (a) { return a.km <= radiusKm; });
    if (prefer && inside.some(isAirliner)) inside = inside.filter(isAirliner);
    var p = inside[0];
    // Position relative au domicile, normalisée sur le rayon (pour une vue radar)
    var place = function (a) {
      var b = rad(bearing(lat, lon, a.lat, a.lon)), r = Math.min(1, a.km / radiusKm);
      root.style.setProperty('--px', (Math.sin(b) * r).toFixed(3));
      root.style.setProperty('--py', (-Math.cos(b) * r).toFixed(3));
    };

    if (!p) {
      root.classList.add('fp--empty');
      set('none', t.none);
      var n = planes[0];
      if (n) {
        place(n);
        root.classList.add('fp--has-nearest');
        set('nearestCs', n.cs || n.r || n.hex);
        set('nearestDist', dist(n.km));
        set('nearestDir', t.dir[sector(n)]);
        set('nearestText', (n.cs || n.r || n.hex) + ' · ' + t.at(dist(n.km), t.compass[sector(n)]));
      } else {
        set('nearestText', t.quiet);
      }
      return fitAll();
    }

    root.classList.add('fp--plane');
    place(p);
    var track = Math.round(p.track != null ? p.track : (p.true_heading || 0));
    root.style.setProperty('--track', track + 'deg');
    if (track < 180) root.classList.add('fp--east');
    var ft = p.alt_geom || p.alt_baro || 0, rate = p.baro_rate || p.geom_rate || 0;
    var phaseKey = rate > 400 ? 'climb' : rate < -400 ? 'descent' : ft > 20000 ? 'cruise' : 'level';
    root.classList.add('fp--' + phaseKey);
    set('alt', imperial ? fmt(ft, t) + ' ft' : fmt(ft * 0.3048, t) + ' m');
    set('speed', imperial ? fmt((p.gs || 0) * 1.1508, t) + ' mph' : fmt((p.gs || 0) * 1.852, t) + ' km/h');
    set('phase', t.phase[phaseKey]);
    set('dist', dist(p.km, 1));
    set('dir', t.dir[sector(p)]);
    set('distWhere', t.at(dist(p.km, 1), t.compass[sector(p)]));
    set('heading', track + '°');
    set('reg', p.r || '—');
    var model = TYPES[p.t] || (p.desc ? titleCase(p.desc) : '') || p.t || t.unknownAc;
    set('model', model);

    function paint(route, ac) {
      var airline = (route && route.airline) || {};
      var icao = airline.icao || (/^[A-Z]{3}\d/.test(p.cs) ? p.cs.substr(0, 3) : '');
      var name = (airline.name || '').replace(/\s+(AOC|Airlines? Ltd\.?)$/, '') || (ac && ac.registered_owner) || '';
      var iata = route && route.callsign_iata, m = iata && iata.match(/^([A-Z0-9]{2})(\d+)$/);
      var flight = m ? m[1] + ('00' + m[2]).slice(-Math.max(3, m[2].length)) : (iata || p.cs || p.r || p.hex);
      var o = route && route.origin, d = route && route.destination;
      set('flight', flight);
      root.classList.toggle('fp--route', !!(o && d));
      root.classList.toggle('fp--noroute', !(o && d));
      if (o && d) {
        set('airline', name || icao || t.private);
        set('from', city(o.municipality) || o.iata_code);
        set('to', city(d.municipality) || d.iata_code);
        set('fromCode', o.iata_code || '···');
        set('toCode', d.iata_code || '···');
        set('title', city(d.municipality) || d.iata_code);
      } else {
        // Sans itinéraire (vol privé, d'affaires, militaire…) : l'opérateur ou le modèle en titre
        set('airline', name || t.private);
        set('from', ''); set('to', '');
        set('fromCode', '···'); set('toCode', '···');
        set('title', name || model);
      }
      set('noRoute', t.noRoute);
      if (color) {
        var lv = LIVERIES[icao] || ['#ffffff', '#8a8f99', '#c9ccd2', '#8a8f99'];
        ['--tail', '--s1', '--s2', '--body'].forEach(function (k, i) { root.style.setProperty(k, lv[i]); });
      }
      fitAll();
    }
    paint(null, null);
    var reqs = [p.cs ? getJSON('https://api.adsbdb.com/v0/callsign/' + encodeURIComponent(p.cs), 4000) : Promise.resolve(null),
                getJSON('https://api.adsbdb.com/v0/aircraft/' + p.hex, 4000)];
    var airlinerCs = /^[A-Z]{3}\d/.test(p.cs);
    Promise.all(reqs).then(function (r) {
      var route = r[0] && r[0].response && r[0].response.flightroute, ac = r[1] && r[1].response && r[1].response.aircraft;
      // Secours : base de routes VRS (adsb.lol), numéro sans zéros de tête (AMX006 → AMX6)
      var cs = p.cs.replace(/^([A-Z]{3})0*(\d)/, '$1$2');
      var routeP = route || !airlinerCs ? Promise.resolve(route) :
        getJSON('https://vrs-standing-data.adsb.lol/routes/' + cs.substr(0, 2) + '/' + cs + '.json', 3000).then(function (v) {
          var ap = v && v._airports;
          if (!ap || ap.length < 2) return null;
          var leg = function (a) { return { municipality: a.location, iata_code: a.iata || a.icao }; };
          return { airline: { icao: v.airline_code }, origin: leg(ap[0]), destination: leg(ap[ap.length - 1]) };
        });
      return routeP.then(function (rt) {
        var icao = (rt && rt.airline && rt.airline.icao) || (airlinerCs ? p.cs.substr(0, 3) : '');
        if ((rt && rt.airline && rt.airline.name) || !icao) return paint(rt, ac);
        var num = p.cs.match(/^[A-Z]{3}(\d+)$/), known = AIRLINES[icao];
        if (known) {
          rt = rt || {};
          rt.airline = { icao: icao, name: known[0] };
          if (rt.origin && !rt.callsign_iata && known[1] && num) rt.callsign_iata = known[1] + num[1].replace(/^0+/, '');
          return paint(rt, ac);
        }
        // Nom de la compagnie depuis son code OACI, plutôt que le propriétaire de l'appareil (souvent un loueur)
        return getJSON('https://api.adsbdb.com/v0/airline/' + icao, 3000).then(function (a) {
          var al = a && a.response && a.response[0];
          if (al) {
            rt = rt || {};
            rt.airline = { icao: icao, name: al.name };
            if (rt.origin && !rt.callsign_iata && al.iata && num) rt.callsign_iata = al.iata + num[1].replace(/^0+/, '');
          }
          paint(rt, ac);
        });
      });
    });
  }

  // Gouttes / flocons dessinés sous chaque nuage, avec un hasard reproductible
  function precipitation(root, kind, density) {
    var NS = 'http://www.w3.org/2000/svg', g = root.querySelector('.fp-' + kind), seed = 7;
    if (!g) return;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var eink = root.classList.contains('fp--eink');
    root.querySelectorAll('.fp-sky use').forEach(function (u) {
      var m = /translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/.exec(u.getAttribute('transform'));
      if (!m || getComputedStyle(u.parentNode).display === 'none') return;
      var x0 = +m[1], y0 = +m[2], k = +m[3], bottom = y0 + 60 * k;
      var n = Math.round((kind === 'rain' ? 11 : 7) * k * density);
      for (var i = 0; i < n; i++) {
        var x = x0 + (16 + rnd() * 108) * k, y = bottom + 8 + rnd() * (90 + 110 * k);
        if (y > 530) continue;
        var el;
        if (kind === 'rain') {
          var len = 12 + rnd() * 20;
          el = document.createElementNS(NS, 'line');
          el.setAttribute('x1', x); el.setAttribute('y1', y);
          el.setAttribute('x2', x - len * 0.18); el.setAttribute('y2', y + len);
          el.setAttribute('stroke-width', eink ? 3.5 : 2.5 + rnd());
        } else {
          el = document.createElementNS(NS, 'circle');
          el.setAttribute('cx', x); el.setAttribute('cy', y); el.setAttribute('r', 3 + rnd() * 3.5);
        }
        g.appendChild(el);
      }
    });
  }

  function boot() { document.querySelectorAll('.fp:not([data-done])').forEach(render); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    document.querySelectorAll('.fp-fit').forEach(fit);
  });
