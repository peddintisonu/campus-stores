# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## My submission: would I keep this product?

**Yes, I'd keep it.** Its records are sound. The partial return was the one moment where the desk lost information it actually had, so I changed how a loan carries a handover.

**For reviewers:** open `index.html`, click **Restart sample shift**, and play the Film Society story. All changes are in [app.js](app.js) and [styles.css](styles.css). `index.html` is unchanged.

### A moment the product handles well: the 3:45 pm pickup

Issuing Kabir's kit, the form would not let me make a mistake that matters later:
- **PR-06**, the second projector, never appeared as an option because it is in repair. I didn't have to know that.
- When I tried to put the **camera (CA-03)** on the Film Society request, it was refused, because the camera isn't on the approved form.
- A second adapter on the same request was refused too, because only one was approved.

**One slip per physical unit** is also the right model. It's what makes a partial return possible at all. I kept all of this.

### A moment I would change: the 7:30 pm partial return and the 9 am handover

At 7:30 pm Kabir brought back the projector and speaker and said *"Leela has the adapter, she'll bring it at nine."*

- **At 7:30 pm**, the register offered only **Record return** on each slip. I closed two slips, but there was nowhere on the adapter's slip to say *Leela has it, back Sat 9 am*. The slip still read *Kabir Sen · Due Fri 8 pm*. The only place for the real story was a free-text desk book note linked to nothing.
- **At 9 am**, as the new person on the desk, Leela was holding *an* adapter. Inventory has **two identical USB-C → HDMI adapters (AD-12 and AD-15), both in bin C4**. To close the right loan I had to piece it together from the desk book (who), the register (which slip, still in Kabir's name and now overdue) and the label on the item. Nothing on screen connected Leela to L-404.

The desk had every fact it needed at 7:30 pm, but the product had no place to keep it. So the morning shift has to rely on memory and luck.

### The change: the loan carries the handover

| | Before | After |
|---|---|---|
| **Pickup** | Three separate slip forms. Request, collector and return time are picked again each time. | **Issue this request** on the request's page: one row per approved item, collector and return time entered once, one save. A unit is pre-filled **only when there is a single possible unit**. Identical units (SP-02/SP-05, AD-12/AD-15) must be picked by reading the label. |
| **Return** | Record return per slip, all or nothing. | **Record return** on the request opens a checklist. Each item is *Back at the desk* or *Still out*. A *Still out* item can't be saved without **who has it now** and **when it is coming back**. |
| **Handover** | Free-text note in the desk book. | The slip itself reads *"Now with Leela Das, back by Sat 9 am"*, with an optional note. A **desk book note linked to slip L-404** is written automatically. Full returns add no note: nothing is pending. |
| **Register** | Flat list of slips. | Slips are **grouped by request** (*RQ-214 · 2 of 3 back · 1 outstanding*), with approved items not yet issued flagged and tags for *Due now* and *Overdue*. |
| **Morning** | Read three screens to work out what is expected. | A **Due back this shift** strip opens the register: *AD-12 · with Leela Das · Due now*. |
| **Check-in** | Find the slip in the list by hand. | **Check in a unit by ID**: type the label. **AD-15** answers *"not on loan, open loans for this type: AD-12 on L-404, with Leela Das"*. **AD-12** shows the slip, the borrower, the current holder and the promise, with **Handed in by** pre-filled with Leela. One click closes it. |

Smaller fixes: errors on the slip form now appear next to the form instead of only in the status bar, and **Restart sample shift** asks for confirmation before wiping the shift.

### The same job, using the change

1. **Fri 3:45 pm:** Requests → Courtyard screening → **Issue this request**. PR-04 is filled in. I read the labels and choose SP-02 and AD-12, collected by Kabir Sen, due Fri 8 pm. **Issue kit** creates L-402, L-403 and L-404 together.
2. **Fri 7:30 pm:** Loan register → RQ-214 → **Record return**. Projector and speaker are *Back at the desk*. The adapter is *Still out*, with Leela Das, back by Sat 9 am. The group reads *2 of 3 back · 1 outstanding*, and slip L-404 now names Leela.
3. **Sat 9:00 am:** the strip at the top already says *AD-12 · with Leela Das · Due now*. Leela hands over an adapter and I type the ID from its label. If it says AD-15, the app tells me that unit isn't on loan and that AD-12 is the one with her. With AD-12, I click **Check in AD-12 · close L-404**. The history now reads *Borrowed by Kabir Sen · Returned by Leela Das · Sat 9:00 am*, and RQ-214 is fully returned.

### What I kept, and what I left out on purpose

- **Kept:** one slip per physical unit, the existing issue rules, the desk book, the four-screen layout and the visual style. The change adds to the loan record rather than replacing the workflow.
- **Split pickups** (Kabir takes two items, Leela one) already work by issuing in two passes. A per-item *Collected by* field would add clutter to the common single-collector pickup, so I didn't add one.
- **A wrong unit going out** (the record says AD-12 but AD-15 left the desk) is not fixed by software alone. Requiring a deliberate, label-based choice between identical units makes it less likely. Barcode scanning at issue and check-in is the next thing I'd look at.

### The observation that would tell me it helped

At a real counter, I'd watch the **first return of the morning for an item another shift recorded as still out**. Does the person on the desk close the correct slip **without asking anyone or opening the desk book**? Today that takes cross-checking three screens and the label. If the change works, they type the ID, see who is bringing it, and close it in one step.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows, use `python` instead of `python3`.

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
