# Honeybee — Zoom Walkthrough Notes

**Live app:** https://honeybee-production-production.up.railway.app
**Deployed branch:** `claude/mlm-team-model-i0ejf` (auto-deploys on push)

Every item from Andy's email is mapped below to **where it lives in the app**, with a
short talk track. Suggested order is grouped by persona so you only log in three times.

> **Login note:** if the production DB has the demo seed, password is `Test123!`:
> - Club Admin: `admin@honeybee.com`
> - Bee Team (referrer): `john@goldenreferrals.com`
> - A-Team (provider): `mike@coolair.com`  *(provider accounts have BOTH dashboards, so use this one to show the toggle)*
> If those don't exist on prod, create a fresh account live — that also demos fix #1.

---

## 0. Quick map (concern → location)

| # | Concern | Where to find it |
|---|---------|------------------|
| 1 | Account creation error | `/register` → **Create Account** |
| 2 | Landing wizard / link at top | Top-nav **Refer** button → `/dashboard/referrer/refer` |
| 3 | Pick 3 A-Team products | Wizard **Step 1** |
| 4 | Back buttons | Top-left of every inner page |
| 5 | Darker A-Team / Bee-Team toggle | Top of dashboard (dark toggle w/ amber active pill) |
| 6 | Lead detail + "who's working my lead" | `/dashboard/leads/[id]` (click any lead) |
| 7 | Wallet commission splits (both teams) | `/dashboard/referrer/wallet` & `/dashboard/provider/wallet` |
| 8 | New A-Team not in catalog | `/admin/applications` → Approve → shows in catalog |
| 9 | Members with no manager / assign | `/admin/team` (top card) |
| 10 | Upline/downline + contact links | `/dashboard/referrer/team` |
| 11 | Bigger font | Global — visible everywhere |

---

## 1. Start as a guest — Account creation (Concern 1)

1. Go to **`/register`**.
2. Fill in company + name + email, pick "Refer customers", **Create Account**.
3. **Talk track:** "This used to throw an error every time once demo data was loaded —
   the member-ID generator was colliding on existing IDs. It now allocates the next
   ID correctly and retries safely, so sign-up works."

> Bonus: registering with "Receive referrals as a service provider" creates a *pending
> A-Team application* — we'll approve it in the Admin section (Concern 8).

---

## 2. As a Bee Team member (referrer)

Log in as the referrer. Land on **`/dashboard/referrer`**.

### The "Refer" landing wizard (Concerns 2 & 3)
- Click the **Refer** button (top nav) or the amber **"Refer a Customer"** card →
  **`/dashboard/referrer/refer`**.
- **Step 1 – Choose products:** search/filter the A-Team Catalog, pick **up to 3**
  products (cards highlight + a counter shows "x/3"). *(Concern 3)*
- **Step 2 – Review pitch:** for each pick it shows the **photos**, **selling points**,
  **do's & don'ts**, and **A-Team company info** (name, member ID, service ZIP,
  commission, categories).
- **Step 3 – Send referral:** fill homeowner info + optional photos → **Submit**.
- **Talk track:** "One guided flow from picking products to sending the referral. It
  submits the referral to each chosen A-Team."
- **Discussion point for the call:** right now selecting 3 products creates **one
  referral per A-Team**. If you'd rather it send to just one, we can change that.

### Back buttons (Concern 4)
- Point out the **"Back to dashboard"** link top-left on the wizard and every inner page.

### Who's working my lead (Concern 6 — referrer side)
- Go to **My Referrals** (`/dashboard/referrer/referrals`).
- The table shows the **Working A-Team**, **status**, and **est. commission**.
- Click any row → **Lead detail** (`/dashboard/leads/[id]`):
  - "Who is working your lead" card with the A-Team's **name, email (mailto), phone (tel)**
    and a **"View A-Team company info"** link.
  - Commission (rate, estimated/earned), full project details, photos, activity.
- **Talk track:** "Members can now follow the referral and contact the A-Team directly."

### Wallet — where every penny goes (Concern 7 — Bee Team)
- Go to **Wallet** (`/dashboard/referrer/wallet`).
- **Available / Pending / Paid YTD / Lifetime** summary at top.
- **"Your earnings by split"** table = your money broken out by category.
- **"Where every penny goes"** = the **full 12-line split per referral**, grouped into
  *To the referrer / Management team / To the club / Lifetime sponsor / Member benefits
  & pools / Platform.*
- **Talk track:** "Exactly what Andy asked — see where every penny went: to them, the
  club, benefits, the management team."

### Team — upline/downline + contact (Concern 10)
- Go to **Team** (`/dashboard/referrer/team`).
- **Upline** list shows each manager with **email/phone contact links**.
- **Downline tree** shows members with mail/phone icons.
- Also here: **change my L-1 Manager**.

---

## 3. As an A-Team member (provider)

Log in as the provider (or use the toggle if your account has both).

### Darker dashboard toggle (Concern 5)
- At the top, the **dark toggle** with a bright **amber active pill** clearly shows
  **Bee Team** vs **A-Team**. Click it to switch dashboards.
- **Talk track:** "Much more obvious which dashboard you're on."
- *(Only appears for accounts that have both portals — provider accounts do.)*

### A-Team leads: new / working / completed (Concern 6 — A-Team side)
- On **`/dashboard/provider`**, the four stat cards are now clickable:
  - **New Leads** → just-came-in list
  - **Working** → accepted/in-progress
  - **Completed** → **Sold & Lost** history (`/dashboard/provider/leads/completed`)
- In any lead list, **"View full details"** → the same shared **Lead detail** page, which
  for the A-Team shows **"Who sent you this lead"** (the referrer's contact) so they can
  follow up.

### Wallet with commission splits (Concern 7 — A-Team)
- Go to **Wallet** (`/dashboard/provider/wallet`).
- Top: **Outstanding owed / Total referral revenue / ROI** + the per-job charges table.
- New **"Commission splits"** section: for each closed job, the **full split** of the
  commission they paid across the referrer, management, club, benefits, platform.

---

## 4. As the Club Admin

Log in as admin → **`/admin`**.

### New A-Team now appears in the catalog (Concern 8)
- Go to **Applications** (`/admin/applications`) → **Approve** a pending A-Team
  (e.g. the one you registered in step 1).
- **Talk track:** "Approving an A-Team now tags them as a provider AND creates a
  published catalog profile, so they show up immediately."
- Verify: open **A-Team Catalog** (`/dashboard/referrer/providers`) — the new provider
  is listed. They'll see a "finish your profile" nudge until they fill in real details.

### Members with no manager + assign one (Concern 9)
- Go to **Team** (`/admin/team`).
- The top **"Unassigned members"** card lists everyone with no L-1 Manager and an inline
  **"Assign a manager…"** dropdown + **Assign** button.
- **Talk track:** "Unassigned members report to the club by default; you can now give
  them a manager right from here." (Cycle-safe — it won't let you create loops.)
- Below: the full team tree with contact links.

---

## 5. Cross-cutting

- **Bigger fonts (Concern 11):** the whole app's base font size was increased — visible
  on every page.
- **Back buttons (Concern 4):** present on catalog, submit, wallets, team, lead detail,
  provider leads/pitch/settings — top-left of each.

---

## 6. Notes / open items to raise on the call

1. **Wizard submission model** — currently one referral per selected A-Team. Confirm
   that's the desired behavior vs. send-to-one.
2. **Auto-created A-Team profiles** start as placeholders (ZIP `00000`, 10% commission)
   until the provider completes Settings; the "View company info" public page link
   appears once they publish a pitch.
3. **Env vars on Railway** — `UPLOADTHING_TOKEN` must be set for photo uploads in the
   wizard/pitch; `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL` should point at the
   railway.app domain.
4. No database migration was needed — the schema was untouched.
