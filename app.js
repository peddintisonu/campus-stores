(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  // Return-by times in desk order, and where each shift phase sits on that scale.
  const times = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  const rank = (t) => times.indexOf(t) + 1;
  const nowRank = [0.1, 0.9, 2];
  // Latest return time each shift covers: Friday shifts run to 8 pm, Saturday morning to noon.
  const shiftEnd = [1, 1, 4];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    prefill: "",
    returning: "",
    lookup: "",
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const select = (label, key, options, { required = true, value = "" } = {}) =>
    "<label><span>" +
    label +
    '</span><select name="' +
    key +
    '"' +
    (required ? " required" : "") +
    '><option value="">Select…</option>' +
    opts(options, value) +
    "</select></label>";
  const now = () => shifts[s.phase].time;
  const typeOf = (l) => getAsset(l.asset).type;
  const dueOf = (l) => l.expected || l.due;
  const dueTag = (l) => {
    const d = rank(dueOf(l)) - nowRank[s.phase];
    if (d < 0) return '<span class="tag late">Overdue · ' + esc(dueOf(l)) + "</span>";
    if (d === 0) return '<span class="tag soon">Due now</span>';
    return badge((l.expected ? "Promised " : "Due ") + dueOf(l));
  };
  // Approved item types on a request that have no open or closed slip yet.
  const notIssued = (r) =>
    r.items.filter(
      (t) => !s.loans.some((l) => l.req === r.id && typeOf(l) === t),
    );
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p>" +
        (notIssued(r).length
          ? '<div class="buttons">' +
            btn("Issue this request", "issuereq", r.id, "primary") +
            "<small>Not issued yet: " +
            esc(notIssued(r).join(", ")) +
            "</small></div>"
          : '<p class="tag good">Every approved item has a slip</p>') +
        "</div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      const l = out(a.id);
      html += row(
        a.id + " · " + a.type,
        a.model +
          " · " +
          a.bin +
          (l ? " · L-" + l.num + " · with " + (l.holder || l.who) : ""),
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const pre = getReq(s.prefill);
      if (pre && notIssued(pre).length) return html + kitForm(pre, available);
      return (
        html +
        (pre && notIssued(pre).length
          ? '<p class="hint">Issuing <b>' +
            esc(pre.id + " · " + pre.club) +
            "</b>. Still to issue: " +
            esc(notIssued(pre).join(", ")) +
            "</p>"
          : "") +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
          { value: s.prefill },
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          times.map((d) => [d, d]),
          { value: pre ? pre.due : "" },
        ) +
        '</div><p class="formerror" role="alert" data-formerror></p><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html += dueStrip() + checkin();
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    // One group per request, newest activity first.
    const reqIds = [
      ...new Set(
        s.loans
          .slice()
          .reverse()
          .map((l) => l.req),
      ),
    ];
    let any = false;
    for (const id of reqIds) {
      const r = getReq(id);
      const all = s.loans.filter((l) => l.req === id);
      const open = all.filter((l) => !l.back);
      if (s.onlyOpen && !open.length) continue;
      any = true;
      const missing = notIssued(r);
      html +=
        '<section class="group"><div class="grouphead"><div><strong>' +
        esc(r.id + " · " + r.club) +
        "</strong><small>" +
        esc(r.event) +
        " · " +
        (all.length - open.length) +
        " of " +
        all.length +
        " back" +
        (open.length ? " · " + open.length + " outstanding" : "") +
        "</small>" +
        (missing.length
          ? '<small class="warn">Approved but not issued: ' +
            esc(missing.join(", ")) +
            "</small>"
          : "") +
        "</div>" +
        (open.length && s.returning !== id
          ? btn("Record return", "returning", id)
          : "") +
        "</div>";
      html +=
        s.returning === id
          ? returnForm(r, open)
          : (s.onlyOpen ? open : all).map(slipRow).join("");
      html += "</section>";
    }
    if (!any) html += "<p>No outstanding slips.</p>";
    return html;
  }
  // One form for a whole approved request: one unit picker per approved item,
  // collector and return time entered once. Saves one slip per unit.
  function kitForm(r, available) {
    const types = notIssued(r);
    return (
      '<form data-kit="' +
      esc(r.id) +
      '"><p class="hint">Issuing <b>' +
      esc(r.id + " · " + r.club + " · " + r.event) +
      "</b>. Where identical units sit on the shelf, <b>read the ID label on the one you hand over</b> and pick it. Only items with a single possible unit are filled in for you.</p>" +
      types
        .map((t, i) => {
          const units = available.filter((a) => a.type === t);
          return (
            '<div class="kitline"><div><strong>' +
            esc(t) +
            "</strong><small>" +
            (units.length
              ? units.map((a) => a.id + " in " + a.bin).join(" · ")
              : "No unit available") +
            '</small></div><select required name="unit-' +
            i +
            '" data-type="' +
            esc(t) +
            '"><option value="">Select the unit by its label…</option>' +
            opts(
              units
                .map((a) => [a.id, a.id + " · " + a.model + " · " + a.bin])
                .concat([["skip", "Not issuing now"]]),
              // Pre-fill only when there is no choice to get wrong.
              units.length === 1 ? units[0].id : units.length ? "" : "skip",
            ) +
            "</select></div>"
          );
        })
        .join("") +
      '<div class="form">' +
      select(
        "Collected by",
        "who",
        people.map((p) => [p, p]),
      ) +
      select(
        "Return by",
        "due",
        times.map((d) => [d, d]),
        { value: r.due },
      ) +
      '</div><p class="formerror" role="alert" data-formerror></p><button type="submit" class="primary">Issue kit</button></form>'
    );
  }
  function slipRow(l) {
    const a = getAsset(l.asset);
    let sub = "Borrowed by " + l.who + (l.issued ? " · " + l.issued : "");
    if (l.back)
      sub +=
        " · Returned" +
        (l.returnedBy && l.returnedBy !== l.who ? " by " + l.returnedBy : "") +
        (l.returned ? " · " + l.returned : "");
    else if (l.holder)
      sub += " · Now with " + l.holder + ", back by " + l.expected;
    else sub += " · Due " + l.due;
    return (
      row(
        "L-" + l.num + " · " + l.asset + " · " + a.type,
        sub,
        l.back ? badge("Returned", true) : dueTag(l),
      ) +
      (l.handover && !l.back
        ? '<p class="slipnote">' + esc(l.handover) + "</p>"
        : "")
    );
  }
  function returnForm(r, open) {
    return (
      '<form data-return="' +
      esc(r.id) +
      '"><p class="hint">Mark each item. Anything still out needs who has it and when it is coming back. The next shift sees this on the slip.</p>' +
      open
        .map(
          (l) =>
            '<fieldset class="retline"><legend>L-' +
            l.num +
            " · " +
            esc(l.asset + " · " + typeOf(l)) +
            '</legend><div class="choices"><label><input type="radio" name="st-' +
            l.num +
            '" value="back" checked> Back at the desk</label><label><input type="radio" name="st-' +
            l.num +
            '" value="out"> Still out</label></div><div class="outfields form">' +
            select(
              "Who has it now",
              "holder-" + l.num,
              people.map((p) => [p, p]),
              { required: false, value: l.holder || "" },
            ) +
            select(
              "Coming back by",
              "exp-" + l.num,
              times.map((t) => [t, t]),
              { required: false, value: l.expected || "" },
            ) +
            '<label class="full"><span>Note for the next shift (optional)</span><input name="note-' +
            l.num +
            '" maxlength="200" autocomplete="off"></label></div></fieldset>',
        )
        .join("") +
      '<p class="formerror" role="alert" data-formerror></p><div class="buttons"><button type="submit" class="primary">Save return</button>' +
      btn("Cancel", "cancelreturn") +
      "</div></form>"
    );
  }
  // What the person on this shift should expect at the counter, earliest first.
  function dueStrip() {
    const due = s.loans
      .filter((l) => !l.back && rank(dueOf(l)) <= shiftEnd[s.phase])
      .sort((a, b) => rank(dueOf(a)) - rank(dueOf(b)));
    if (!due.length) return "";
    return (
      '<div class="duestrip"><b>Due back this shift</b>' +
      due
        .map(
          (l) =>
            '<div class="dueline"><span><strong>' +
            esc(l.asset + " · " + typeOf(l)) +
            "</strong> " +
            esc(
              getReq(l.req).club +
                " · " +
                (l.holder ? "with " + l.holder : l.who),
            ) +
            "</span>" +
            dueTag(l) +
            btn("Open slip", "find", l.asset) +
            "</div>",
        )
        .join("") +
      "</div>"
    );
  }
  function checkin() {
    let html =
      '<form data-lookup class="checkin"><label><span>Check in a unit by ID</span><input name="unit" list="unit-ids" placeholder="ID on the item label, e.g. AD-12" autocomplete="off" value="' +
      esc(s.lookup) +
      '"></label><button type="submit">Find slip</button><datalist id="unit-ids">' +
      assets.map((a) => '<option value="' + a.id + '">').join("") +
      "</datalist></form>";
    if (!s.lookup) return html;
    const a = getAsset(s.lookup);
    const clear = btn("Clear", "clearlookup");
    if (!a)
      return (
        html +
        '<div class="lookup warn"><h3>No unit called ' +
        esc(s.lookup) +
        "</h3><p>Check the ID on the item’s label.</p>" +
        clear +
        "</div>"
      );
    const l = out(a.id);
    if (!l) {
      const others = s.loans.filter((x) => !x.back && typeOf(x) === a.type);
      return (
        html +
        '<div class="lookup warn"><h3>' +
        esc(a.id) +
        " is not on loan</h3><p>" +
        (a.repair
          ? "It is booked into the workshop for repair."
          : "Records say it is on the shelf in bin " + esc(a.bin) + ".") +
        "</p>" +
        (others.length
          ? "<p><b>Open loans for this type:</b> " +
            others
              .map((x) =>
                esc(
                  x.asset +
                    " on L-" +
                    x.num +
                    " (" +
                    getReq(x.req).club +
                    ", with " +
                    (x.holder || x.who) +
                    ")",
                ),
              )
              .join("; ") +
            ". Check the label on the item again.</p>"
          : "") +
        clear +
        "</div>"
      );
    }
    const r = getReq(l.req);
    return (
      html +
      '<div class="lookup"><small>Slip L-' +
      l.num +
      " · " +
      esc(r.id + " · " + r.club + " · " + r.event) +
      "</small><h3>" +
      esc(a.id + " · " + a.type) +
      "</h3><p>" +
      esc(a.model) +
      " · home bin " +
      esc(a.bin) +
      "</p><p>Borrowed by <b>" +
      esc(l.who) +
      "</b>" +
      (l.issued ? " · " + esc(l.issued) : "") +
      " · due " +
      esc(l.due) +
      "</p>" +
      (l.holder
        ? "<p>Now with <b>" +
          esc(l.holder) +
          "</b> · promised back by " +
          esc(l.expected) +
          "</p>"
        : "") +
      (l.handover ? '<p class="slipnote">' + esc(l.handover) + "</p>" : "") +
      '<div class="form">' +
      select(
        "Handed in by",
        "returnedby",
        people.map((p) => [p, p]),
        { required: false, value: l.holder || l.who },
      ) +
      "</div>" +
      '<div class="buttons">' +
      btn("Check in " + a.id + " · close L-" + l.num, "checkin", String(l.num), "primary") +
      clear +
      "</div></div>"
    );
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        n.slip ? "Counter handover · slip L-" + n.slip : "Counter handover",
        n.text,
      ]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        if (
          !confirm(
            "Restart the sample shift? Every slip, return and note from this shift will be cleared.",
          )
        )
          return;
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.returning = "";
        break;
      case "issuereq":
        s.tab = "Loan register";
        s.editing = true;
        s.prefill = v;
        s.selected = "";
        break;
      case "returning":
        s.returning = v;
        s.editing = false;
        break;
      case "cancelreturn":
        s.returning = "";
        break;
      case "clearlookup":
        s.lookup = "";
        break;
      case "find":
        s.lookup = v;
        break;
      case "checkin": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        const by = q('select[name="returnedby"]')?.value;
        l.back = true;
        l.returned = now();
        l.returnedBy = people.includes(by) ? by : l.holder || l.who;
        s.lookup = "";
        const left = s.loans.filter((x) => x.req === l.req && !x.back).length;
        s.notice =
          l.asset +
          " checked in from " +
          l.returnedBy +
          ". Slip L-" +
          l.num +
          " closed. " +
          (left
            ? left + " item(s) still out on " + l.req + "."
            : l.req + " is fully returned.");
        break;
      }
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.prefill = "";
        s.returning = "";
        break;
      case "cancel":
        s.editing = false;
        s.prefill = "";
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        l.back = true;
        s.notice = l.asset + " returned to stock. Slip L-" + l.num + " closed.";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-lookup]")) {
      s.lookup = String(form.get("unit") || "")
        .trim()
        .toUpperCase();
      commit();
      return;
    }
    if (f.matches("[data-kit]")) {
      const r = getReq(f.dataset.kit);
      const err = (m) => (f.querySelector("[data-formerror]").textContent = m);
      const who = form.get("who"),
        due = form.get("due");
      if (!r || !people.includes(who) || !times.includes(due))
        return err("Choose who is collecting and when it is due back.");
      const picks = [...f.querySelectorAll("select[data-type]")]
        .map((sel) => ({ type: sel.dataset.type, unit: getAsset(sel.value) }))
        .filter((p) => p.unit);
      if (!picks.length) return err("Choose at least one unit to issue.");
      for (const p of picks)
        if (p.unit.type !== p.type || p.unit.repair || out(p.unit.id))
          return err(p.unit.id + " cannot be issued. Choose another unit.");
      let num = Math.max(...s.loans.map((l) => l.num));
      const made = picks.map((p) => {
        num++;
        s.loans.push({
          num,
          req: r.id,
          asset: p.unit.id,
          who,
          due,
          back: false,
          issued: now(),
        });
        return p.unit.id + " (L-" + num + ")";
      });
      const left = notIssued(r);
      s.editing = false;
      s.prefill = "";
      commit(
        "Issued to " +
          who +
          ": " +
          made.join(", ") +
          "." +
          (left.length
            ? " Not issued: " + left.join(", ") + "."
            : " Every approved item on " + r.id + " has a slip."),
      );
      return;
    }
    if (f.matches("[data-return]")) {
      const r = getReq(f.dataset.return);
      if (!r) return;
      const open = s.loans.filter((l) => l.req === r.id && !l.back);
      const plan = [];
      for (const l of open) {
        if (form.get("st-" + l.num) !== "out") {
          plan.push({ l, back: true });
          continue;
        }
        const holder = form.get("holder-" + l.num);
        const expected = form.get("exp-" + l.num);
        if (!people.includes(holder) || !times.includes(expected)) {
          f.querySelector("[data-formerror]").textContent =
            "For L-" +
            l.num +
            " (" +
            l.asset +
            "), say who has it now and when it is coming back.";
          return;
        }
        const note = String(form.get("note-" + l.num) || "").trim();
        plan.push({ l, holder, expected, note });
      }
      let back = 0,
        still = 0;
      for (const p of plan) {
        const l = p.l;
        if (p.back) {
          l.back = true;
          l.returned = now();
          l.returnedBy = l.holder || l.who;
          back++;
          continue;
        }
        still++;
        l.holder = p.holder;
        l.expected = p.expected;
        l.handover = p.note;
        s.notes.push({
          phase: s.phase,
          slip: l.num,
          text:
            l.asset +
            " (" +
            typeOf(l) +
            ") for " +
            r.club +
            " is still out. Borrowed by " +
            l.who +
            "; now with " +
            p.holder +
            ", back by " +
            p.expected +
            "." +
            (p.note ? " " + p.note : ""),
        });
      }
      s.returning = "";
      commit(
        "Return saved for " +
          r.id +
          ": " +
          back +
          " back, " +
          still +
          " still out." +
          (still ? " Handover note added to the desk book." : ""),
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    const err = f.querySelector("[data-formerror]");
    if (!r.items.includes(unit.type)) {
      err.textContent =
        unit.id +
        " (" +
        unit.type +
        ") is not on " +
        r.id +
        ". Approved items: " +
        r.items.join(", ") +
        ".";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      err.textContent =
        r.id +
        " already has a " +
        unit.type +
        " on loan. The approved quantity is one.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false, issued: now() });
    const left = notIssued(r);
    // Keep the form open on the same request until the whole approved kit has a slip.
    s.editing = left.length > 0;
    s.prefill = left.length ? req : "";
    commit(
      "Issued " +
        asset +
        " to " +
        who +
        " on slip L-" +
        num +
        "." +
        (left.length
          ? " Still to issue for " + req + ": " + left.join(", ") + "."
          : " Every approved item on " + req + " has a slip."),
    );
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          (!l.holder || people.includes(l.holder)) &&
          (!l.expected || times.includes(l.expected)),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      prefill: getReq(d.prefill) ? d.prefill : "",
      returning: "",
      lookup: typeof d.lookup === "string" ? d.lookup : "",
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
