(function () {
  var SUPABASE_URL = "https://fotugzhxlajyjdnjteld.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdHVnemh4bGFqeWpkbmp0ZWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDY2MzAsImV4cCI6MjA4MDgyMjYzMH0.GnEzF-iJuiZJH5IVUgszWOq5qv4AeHfFf8Y3_YRW5FA";
  var RSVP_BASE = "https://bloomdate-rsvp.netlify.app";

  function formatNames(names) {
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + " y " + names[names.length - 1];
  }

  async function initInvitation() {
    var token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;

    try {
      var response = await fetch(SUPABASE_URL + "/rest/v1/rpc/get_invite_by_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ p_token: token })
      });

      if (!response.ok) return;
      var rows = await response.json();
      var invite = rows && rows[0];
      if (!invite) return;

      var companions = invite.companions || [];
      var names = [invite.first_name].concat(
        companions.map(function (companion) { return companion.first_name; })
      ).filter(Boolean);
      if (!names.length) return;

      var namesEl = document.getElementById("nombres-invitados");
      if (namesEl) namesEl.textContent = formatNames(names);

      // La frase "Tenés ___ lugares reservados" está impresa en la imagen: acá solo va el número.
      var totalPasses = 1 + companions.length;
      var passesEl = document.getElementById("cantidad-lugares");
      if (passesEl) passesEl.textContent = String(totalPasses);

      var guestImage = document.getElementById("imagen-invitados");
      if (totalPasses === 1) {
        if (guestImage) {
          guestImage.src = "invitados-singular.webp";
          guestImage.alt = "Esta invitación fue creada especialmente para vos. Tenés 1 lugar reservado.";
        }
        if (passesEl) passesEl.classList.add("guest-places--singular");
      } else if (guestImage) {
        guestImage.alt = "Esta invitación fue creada especialmente para ustedes. Tenés " + totalPasses + " lugares reservados.";
      }

      var confirmBtn = document.getElementById("boton-confirmar");
      if (confirmBtn && invite.event_slug) {
        confirmBtn.href = RSVP_BASE + "/r/" + encodeURIComponent(invite.event_slug) + "?invite=" + encodeURIComponent(token);
      }
    } catch (_error) {
      return;
    }
  }

  initInvitation();
})();
