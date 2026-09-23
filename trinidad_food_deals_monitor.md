# Mandate: Trinidad Food Deal Monitor

## Purpose

Run regular checks for **new, cheap or unusually good-value food and
restaurant offers in Trinidad**, with **Chaguanas and nearby Central
Trinidad as the priority area**. Notify the user only when a genuinely
new and worthwhile qualifying offer is found.

The monitor should behave as a change detector, not as a recurring list
of known specials. Do not repeat an offer merely because it is still
running.

## Geographic priority

Search in this order:

1.  **Chaguanas**, including Endeavour, Brentwood, Price Plaza and
    surrounding commercial areas.
2.  **Central Trinidad**, especially Cunupia, Charlieville, Freeport,
    Couva and nearby areas.
3.  **Elsewhere in Trinidad** when an offer is unusually good value or
    otherwise worth travelling for.

Do not restrict searches to restaurants already known to the agent.
Continually discover new restaurants, chains, cafés, takeaways,
bakeries, supermarkets/seafood outlets with prepared-food offers,
pop-ups and other legitimate food venues.

## Dietary requirements

The user's usable food options are **pescatarian and dairy-free**.

Prioritise deals where at least one qualifying meal is available:

-   Fish or seafood without dairy.
-   Sushi or Asian dishes containing fish/seafood, provided cream
    cheese, dairy-based sauces or butter are absent or can reasonably be
    omitted.
-   Fully plant-based/vegan meals.
-   Vegetarian meals only when they are genuinely dairy-free.
-   Vegan baked goods and desserts may be included, including worthwhile
    options elsewhere in Trinidad.

Do **not** assume: - vegetarian = dairy-free; - eggless = vegan; -
dairy-free = vegan; - seafood dishes are dairy-free.

Watch for cheese, cream cheese, milk, cream, butter, ghee, Alfredo
sauces and similar ingredients. If dairy-free status is uncertain, state
that clearly rather than presenting the dish as confirmed.

A very strong general restaurant bargain may occasionally be worth
reporting even when it does not meet the dietary filter, but qualifying
pescatarian/dairy-free deals should dominate the monitor.

## What counts as a worthwhile deal

Look for:

-   Buy-one-get-one-free offers.
-   2-for-1 or second-item discounts.
-   Large percentage discounts.
-   Cheap lunch or dinner specials.
-   Set menus offering unusually good value.
-   Buffet promotions.
-   App-only or online-only offers.
-   Anniversary, opening, holiday and one-day promotions.
-   Restaurant Week or similar promotional menus.
-   Sushi and seafood combos.
-   Cheap fish-and-chips or seafood meals.
-   Vegan/plant-based specials.
-   Chain promotions that apply to a Trinidad or Central Trinidad
    branch.
-   Short-lived social-media promotions.
-   Other offers where the effective price is meaningfully below the
    venue's normal pricing.

Do not report ordinary menu prices as deals unless the price itself is
unusually cheap and useful enough to qualify as a standing bargain.

## Places and categories to check

Search broadly rather than relying on a fixed list.

Pay particular attention to:

-   Sushi restaurants.
-   Chinese, Cantonese, Thai and other Asian restaurants.
-   Indian restaurants with vegan/dairy-free options.
-   Seafood restaurants.
-   Vegan and Ital restaurants.
-   Cafés and bakeries with vegan options.
-   Buffets.
-   Major fast-food and casual-dining chains.
-   Local independent restaurants.
-   Mall and plaza restaurants in Central Trinidad.
-   Current Trinidad Restaurant Week or similar programmes.

Previously useful examples include OMG Sushi, HAKKA, AVALA, Woodford
Café, Passage to Asia, Chinatown Asian Kitchen, Jitu's Asian Kitchen,
Wing Hua and major chains such as Burger King, KFC, Subway, Pizza Hut,
Little Caesars, Church's and TGI Fridays. These are examples, not the
boundaries of the search.

## Freshness and verification

Freshness is critical.

Before reporting an offer:

1.  Verify that the advertised date or recurring day actually includes
    the current date or a clearly stated future date.
2.  Prefer recent official posts, current menus, ordering pages or
    current venue listings.
3.  Check the year on posters and social posts.
4.  Do not infer that an old recurring promotion is still active merely
    because an old page remains indexed.
5.  Where possible, corroborate ambiguous offers with another current
    source.
6.  If a poster or source conflicts with current opening hours or
    another current source, treat the offer as unconfirmed.
7.  Never resurrect an expired promotion because it still appears in
    search results.

## Deduplication

Maintain awareness of previously reported deals.

A deal is **not new** merely because: - it was re-advertised without
changing; - today happens to be its recurring weekday; - another search
result repeats the same promotion; - a different source describes the
same offer.

Report an existing deal again only if there is a meaningful change, such
as: - a new/lower price; - different qualifying menu items; - a new
branch; - an extension or new expiry date; - materially changed terms; -
a genuinely new edition of a time-limited promotion.

## Suggested schedule

Use a **condition-watch automation**.

Recommended cadence: - **Daily morning check** around 8:00 AM Trinidad
time for newly announced deals and offers valid that day. - **Optional
second check in the early afternoon** around 2:00 PM Trinidad time if
the platform permits and short-lived same-day promotions are
important. - A daily check is preferable to weekly because restaurant
promotions are frequently announced with little notice.

The automation should notify only when the condition is met: at least
one new, worthwhile, verified deal has appeared since the previous
successful alert.

## Suggested automation instruction

> Check current food and restaurant specials in Chaguanas, Central
> Trinidad and elsewhere in Trinidad where worthwhile. Find only new,
> cheap or unusually good-value offers that have not been reported
> previously. Prioritise restaurants with fish/seafood or genuinely
> plant-based dairy-free options. Check chains and independents,
> including sushi, Chinese/Cantonese/Asian, Indian, seafood, vegan/Ital,
> cafés, bakeries and current promotional programmes. Verify dates
> carefully using current sources and reject stale posters or expired
> promotions. For each qualifying find, report the venue, location,
> offer, price, relevant pescatarian/dairy-free option, date or
> recurring day, and how long the offer appears valid. If nothing
> meaningfully new is found, do not notify.

## Alert format

Keep alerts compact. For each new deal include:

-   **Venue and location**
-   **Offer**
-   **Price**
-   **Qualifying food option**, including any dairy caveat
-   **When available**
-   **Expiry/validity**
-   A source/link when available

Do not pad an update with old deals simply to produce a notification.

## No-result behaviour

If there is nothing meaningfully new, **send no notification**. Silence
is the intended successful outcome of a check with no qualifying
changes.
