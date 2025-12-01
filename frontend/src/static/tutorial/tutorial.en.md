# Tutorial

**Dofus Minmax** is an application that calculates the best builds in Dofus.  
It is divided into 3 sections :

- **Weights / Min / Max (inputs)** : Define what you want in your build.
- **Item Selection** : Select the items you want to include in the combination calculation.
- **Builds results** : Displays the best combinations of items calculated.

The principle is that by selecting only the most valuable items for the desired characteristics, it is possible to calculate all the possible combinations and come up with the best ones.

I want this application to be as thorough as possible however I also want more casual gamers to be able to use it so here is the

## TL;DR :

- Click on the weight of the characteristics you want in your build. Avoid using Min.
- Set your level
- Click on **"Calculate Best Items"**
- Click on **"Quick Selection"**
- Add exos PA / PM / Range if necessary
- Click on **"Calculate Best Builds"**... And wait
- Compare results
- Repeat if necessary until satisfied

---

# Basic usage

## Weights / Min / Max Inputs

Weights are used to calculate the items, item-sets and builds value.  
Each characteristic is multiplied by its weight (0 if the corresponding weight is not set) to come up with the final value.

Only the highest possible characteristics of the items are taken into account.  
The derived characteristics like lock, dodge, initiative.. are calculated for every items and item sets on load. That means you should only put weight in the characteristic if you value its base effect, not its derived characteristics. E.g. only put weight in wisdom if you value the bonus experience it gives. Putting weight in a derived characteristic already affects its origin characteristic by ricochet.

**Min** is a hard limitation : if a build's final characteristic is under the input it will be skipped (or build value set to 0).  
**Max** is a soft limitation : if a build's final characteristic is over the input it will cap the characteristic to the max input set, also capping its contribution to the final build's value accordingly.

Click on the weight's characteristic you want in your build to add the default weight input. Adjust it if you have some idea of what you want. Don't worry if you don't, you can come back to it later. You can also remove a weight by double-clicking it.

The **AP, MP and Range** min inputs are the most important to set if you know them but you can also use weights or both to compare build options.

Once your weights and min / max inputs are set, click on **"Calculate best Items"**. Also don't forget to set your desired character's level.

---

## Item Selection

The whole database of items and item set is checked against every time the **"Calculate best Items"** button is clicked.

Items with the highest value for each category are displayed in the first column.  
If an item belongs to a set it will show the value with the added set value.  
Clicking on an item will add it to the selection.  
Hovering on an item will show its information.

If an item is below the desired level, it is skipped.  
Items' requirements don't affect the item's value, however if an item's AP and/or MP requirement is incompatible with the corresponding Min input, it is skipped. E.g setting 11 AP as min input will skip AP<11 (or below) items. Setting 12 AP and 6 MP as Min input will skip AP<12 or MP<6 items.

Items' special effects don't affect their value. It may be necessary to **lock** such an item to get results with it if a lot of its value comes from its special effect.

Item sets with the highest score (function explained below) are displayed in the second column.  
Hovering on an item set will show its bonuses and value for each item count. The values shown are incremental: it shows how much value or bonus is added for each additional item count.

**Top 20** highest score item sets are displayed by default.  
If an item belonging to an item set that is not in the top 20 is selected, its item set will be shown anyway at the bottom of the column.  
Clicking on **"Selected"** button next to top 20 will only show the item sets from items that have been selected, regardless of their score.

The third column shows the items that have been selected for each category. All possible combinations of items from this selection will be checked.  
At the bottom of the column is shown the amount of combination that will be calculated from the selection, and the estimated time it will take calculated from a default processing speed. (Format is : **"K" = Thousand, "M" = Million, "B" = Billion, "T" = Trillion**)

Clicking the eye icon next to each item will scroll the view in the other columns to the corresponding item if it is there.

Each selected item can be **"locked"**, meaning that the item will be included in all possible combinations. This can dramatically reduce the amount of combinations. One item of each category can be locked except for rings (2) and dofus (6).

The goal is to select as many good looking items and item sets as possible to include in the combination calculation, while staying under a reasonable amount of combinations so that it doesn't take too long to compute.

For this you have 2 approaches :

- Use the **"Quick Selection"** button at the top of the column. This will add all items from visible item sets and the item with the highest value (without set) from each category (except dofus/trophies). This is faster but the selection may not be optimal.
- Go through each item and each item sets and add them manually if they look good.

Once it's done check the total combinations. Eventually remove the worst item sets if the number is too high. Keep it under let's say **100 million** for a first try. Note that there is no particular issue if you calculate billion of combinations, it will just take more time, heat up and slow down your machine.

At the bottom of the first column you can specify if you're planning to have **AP, MP or Range exos** to your build.

Then click on **"Calculate best Builds"**.

While calculating it will display the progress and the speed at which it computes the combinations.  
You can click the **Save icon** next to it to save the processing speed that is used to calculate the time it takes to compute X combinations for future reference.

When the calculation is done, it will show the results in the **Builds** section.

---

## Builds

The **500 best results** will be displayed in this section, sorted by value. If there was no results fitting the Min requirements it will be left empty.

If a build's characteristic is 0 and its weight is 0 it is not displayed.  
If a build's characteristic is different from 0 and its weight is 0 it is displayed with a lower opacity, indicating that the build's value is not affected by this characteristic.

Characteristics are separated in 3 groups : **Utility, Offense and Defense**. The value that each group adds to the final build's value is shown at the top.

A characteristic that is over the Max input or limited by one of its items requirement is capped to the max input. Shown with a grey arrow from the original value it is capping it from.  
A characteristic that is under the Min input is displayed with a red background and the build's value is set to 0.

One of the main feature of this section is that you can **compare a build**. Other builds will show which items and sets differ, and the difference in stat, value and grouped characteristics value.

All requirements from the build are shown under the characteristics. If a requirement overlap another, they will be merged into the more restrictive one.  
E.g **AP < 11** and **AP < 10** would be merged into just **AP < 10**.

- If a build doesn't fit a requirement for : **Vitality, Strength, Chance, Intelligence, Agility or Wisdom** - it is displayed with a **yellow background**.
- If a build doesn't fit a requirement for : **Level or set bonus < 3** - it is displayed with a **red background** and the build's value is set to 0.
- All other requirements : **AP, MP, [AP or MP], Range and Summons** will behave the same way as Max input : it caps the value to the required value, reducing the build's value accordingly.

If a build is capped by a AP or MP requirement, the characteristic chosen to be capped is the one with the lowest weight input.

You can export a build that you like to **DofusDB** or **DofusBook**.

The reason for returning so many results is that you can go back to the weights/min/max section and update the inputs if you're not satisfied with the results or want to filter builds with specific characteristic. It will dynamically recalculate all **500 build's values** and sort them again. Same thing happens if you update the level or exos.  
If you set a more restrictive Min input, builds that don't fit the requirement anymore will have their value set to 0 and be shown at the bottom of the list.

That's useful if you have a selection with many combinations and you want to avoid running the whole calculation again. Note however that a significant input change could mean that better items and sets should be selected. Also some combinations not present in the top 500 could rise to the top with the new inputs.

---

## Navigation

Each column in selected items and the displayed builds have their own scrolling area, replacing the main page scroll when the mouse is hovered on it.  
Move the mouse outside of these area if you want to scroll the main page, or use the navigation checkpoints on the left of the screen.

When hovering over items or sets, if the information is too large to be displayed in the tooltip box it will be scrollable instead. Scrolling then replaces regular scrolling and will scroll the tooltip box instead. Don't try to move the mouse over the tooltip box to scroll over it, it won't work.

You can use **up and down arrow keys** when checking build results to quickly go through them. Also **left and right arrow keys** to change the current page.

---

# Saved builds

You can save a build that you like. Saved builds are shown in the build section next to **"Results"**. Just like results, the saved builds have their values dynamically updated from **Weights, Min, Max, Level and exos** inputs.

If you make a new search and one of the saved build is exactly the same as one of the build result, then it will use the saved build's name as its name instead of its rank, making it easy to recognize it.

You can also set one of your saved build to compare to the results of a new search.

---

# Saved searches

All the inputs are saved and encoded in the URL. You can copy the URL and paste it in a new tab and slightly modify it so that you can compare two search results.

Saved builds are synced between your tabs / windows so you can use this to make a slightly different search from a new tab, save a build then compare it in the first search without losing your results.

You can save a search in the top bar. Just give it a name so that you can easily come back to it e.g. **"Panda tank"**. If you modify a search after you saved it or loaded it, the saved search text will show **orange**. Save it again so that it shows **green**.

When you first load the page it will check if the URL matches exactly one of your saved searches and load it if that's the case.

Be aware that saved searches and saved builds are only stored in your browser's **local storage**, and so they could be deleted if you clear it for some reason.  
To make sure you don't lose a saved search you can save the url in your browser's bookmarks.  
To make sure you don't lose a build, export it to your prefered Dofus website and save it there. Or you can export it as a new search and save the URL in your bookmarks.

The search is saved in your browser's history when you :

- Click on « Calculate Best Items » or « Calculate Best Builds »
- Create, Load, Save or Share a search

You can navigate through previous searches using your browser's history. It won't erase your search results.

---

# Item sets

## Value per item

To calculate the value that an item set brings to a specific item, we calculate the value of each set bonus then divide it by the amount of item needed to get said bonuses. The highest value found is the one retained.  
We show it as **"Best Value per item"** under each set. This number is then added to the value of each item of the set to come up with the **"Value with Set"**.

In most cases this best value per item is the value you get when selecting all items in the set. However there may be some cases where the additional bonuses you get from selecting one more item in the set have a low value and therefore we should instead use the one with a higher potential value per item. The idea is to be able to sort items by their highest potential value.

## Scoring

To calculate the best item sets, we use a scoring function. You don't need to understand how it works but I'll explain it for those who are interested. Skip the following paragraph otherwise.

First we go through each item in the set and substract the value from the item to the best item of its category. This represents how much value we're losing compared to if we just picked the best item of its category. Then we sort these numbers by value from highest to lowest.  
Then for each set bonus, we sum the value we would be losing by picking X first items, substract it to the set bonus' value and divide the total by the amount of items in the set. Similarly to the Value per item calculation, we only retain the highest value found, which gives us the final score.

The idea here is to rank item sets by how much value they add, relatively to the value lost by not picking the best value item instead, in the best case scenario.

A negative scoring doesn't necessarily mean that it is a bad item set to select. It means that, in the best case scenario, more value is lost by picking items of the item set than simply picking each best item of their respective category individually. However an item set may give bonuses that interact with Min or Max inputs.  
E.g. it may be the only way to reach the minimum amount of AP desired, or other items may give bonuses that are capped by Max stat, or have additional requirements not taken into account in the item value calculation.

There is one downside with this scoring function is that the best item in its category may be an item that you don't want or cannot use in your buid - if it's too expensive for example. And so maybe it would be better to show item sets that have an item from this category a little bit higher in the list. I believe that in most cases it shouldn't be too much of an issue but you shouldn't see this scoring function as an absolute truth.

This scoring is a way to show good options for your build and it may be worth going through lower score item sets and check if it makes sense to add them in the item selection.

## Item sets partially selectable

If an item set has an item that is not selectable because :

- Item level is higher than the level input.
- Item Min input is incompatible with its requirement
- Item is the same category as a locked item

The scoring and value per item functions will take into account that that the item cannot be selected. The possible combinations of item sets that have such items will be limited accordingly.  
If only one item of an item set can be selected (or none) then its score will be **-Infinity** and it won't be displayed.

If you lock an item, it can be good to recalculate best items to get the updated score and value per item of the item sets. This tells you **"given the items you have locked, these are the best items and item sets that fit the remaining slots"**. You could even use this to come up with a build by incrementally locking items/sets and recalculating the best items at every step.

## Quick selection

**Quick selection** adds visible items from all visible sets in the second column. But if an item in a visible set is not selectable because of level being too low or incompatible with Min inputs, it won't be selected.

You can adjust the displayed set amount (**"Top 20"**) up and down to quickly add more (or less) sets in the selection when clicking **"Quick Selection"**.

On top of that, Quick selection adds the item with highest value (or 2 for rings) of each category. The logic behind it is that since this item has the highest value without being linked to an item set then selecting another one would bring less value.  
Of course if the item's characteristics interact with capped values it could matter a lot. But this is a quick selection, that's why you should probably review which items are added and add more options if you want better results.

## Momore set

**Momore set** is the only set with requirements and it works similarly as with item requirements. If you set a MP/Range/summons Min input incompatible with a combination bonus, the scoring and value per item will take it into account and exclude the possible combination(s) accordingly.

Otherwise the final build's value will be capped by the item set's requirement depending on the combination bonus. If you want to compare builds from this item set you should put a low or null weight input for the characteristics it caps, otherwise better options may come up.

---

# Dofus / Trophies

Dofus and Trophies can be selected to be included in the combination calculation.  
The main purpose of it is to calculate the best builds with Dofus or Trophies affecting characteristics that are naturally capped. Most notably **Dofus Ocre, Vulbis and Sylvestre** can have a great impact on the build result.

## Combinations

It is also possible to calculate multiple combinations of Dofus / Trophies but be aware that the amount of combinations will raise exponentially and its use is probably quite limited, unless there is a specific need.  
It is recommended and easiest to just keep one combination of Dofus / Trophies and do a new search with a different combination if necessary and compare the results. I will however explain how it works.

- If you select **6 Dofus / Trophies or less**, there is only one possible combination.
- If you select **7**, that's **7 combinations**, one combination for each Dofus / Trophy missing.
- If you select **8**, that's **28 combinations**, which is equivalent to the combinations of selecting 2 Dofus / Trophies amongst 8.
- If you select **9**, that's **84 combinations**. You can see that the amount of combinations raises exponentially and there is most likely no use going through all of them.

One possible use however is to compare different build results if you're not sure what to choose for the last or two lasts available slots. For that you should lock the Dofus / Trophies you know for sure you're going to use and keep the few ones unlocked.

For example you could lock 5 Dofus / Trophies and have **Jackanapes** (+1 AP, -1MP) and a regular Trophy giving value to your build, unlocked. That would be only 2 combinations and you could compare the different results with or without Jackanapes in one search.

## Trophies with set bonus < 3

If you select at least one Trophy with a requirement of **set bonus < 3** then two combination groups are made :

- One group with only regular Dofus / Trophies
- One group where **set bonus < 3 Trophies** have priority

The idea is to compare builds where there is the **set bonus < 3** requirement against builds without the requirement.  
If you have at least one trophy with a constraining requirement, then similar trophies should be grouped together. It doesn't make sense to mix up combinations where we pick one set bonus < 3 Trophy and a regular trophy over another set bonus < 3 Trophy, which has a higher value without making the final build requirement any better.

The first "regular" group is the combinations of the Dofus / Trophies without the set bonus < 3 Trophies. It can create an empty group if there are only set bonus < 3 Trophies selected.

The second group with set bonus < 3 is created like so :

- First select the locked "regular" Dofus / Trophies
- Then if there are as many or more set bonus < 3 Throphies than remaining slots => Create combinations out of those => Done
- Else fill the remaining slots with only set bonus < 3 Trophies
- Then if there are unlocked regular Trophies => Create combinations out of those in the remaining slots => Done

The simplest way to approach this is to have only one combination (6 items) for each group. To do this, select 6 regular Dofus / Trophies, then select **[6 - regular Dofus / Trophies locked]** set bonus < 3 Trophies. For example you select 6 regular Trophies, lock 2 of them, then add 4 set bonus < 3 Trophies.

If you want to do more complex combinations, you should start with only selecting the Dofus / Trophies before other items and observe how many combinations it creates. You can also calculate best builds out of only those without any other item to check that it created the combination you expect (remove any Min input to get results).

This grouping doesn't happen if you lock at least one set bonus < 3 Trophy. In that case, all combinations are calculated normally. So if you just want to explore builds with this requirement, lock one set bonus < 3 Trophy. This might be easier to do if this grouping feature is hard to grasp (understandably so).

---

# How to set good inputs

## Weights

The default weight inputs are mostly taken from their sink cost when forgemaging, and adapted when it felt like they were too high or too low. I compared the Pets and transcendance runes to come up with more accurate weights.

A weight input is only strong in comparison to other weights. If you put a weight input of 1 for Lock and 2 for Heals, it is strictly equivalent to putting a weight input of 2 for Lock and 4 for heals. What matters is the ratio between weights.

A good way to reason about weights is to set a weight of 1 for one characteristic e.g. strength, then go through other characteristics and ask yourself **"how much strength is this characteristic worth ? Do I prefer to have 100 strength or 20 Lock ?"**. If it is equivalent then 5 strength would be equivalent to 1 Lock so a weight of 5 should be set to Lock.

If you feel confident about a ratio that you set for another characteristic then you can do the same process with this other characteristic as basis to come up with other ratios or to confirm that an existing ratio is really what you want.

If you're not sure about how much a characteristic is worth, it may be better to leave its weight empty or low. You can add more weight to it and compare results after.

## Offense Weights

**Power weight** should always be equal to the sum of the weights in **Strength, Intelligence, Chance and agility**.  
**Damage weight** should always be equal to the sum of the weights in **Neutral, Earth, Fire, Water and Air damages**.  
The app will sum them automatically unless you have deactivated the **"Automatic Weight Calculation"**.

Neutral Damage should probably be left at 0 or quite low since not many spells have a Neutral Damage line and most items that improve Earth Damage also improve Neutral Damage so their value would be counted twice.

If you play a critical build, **Critical Damage weight** should always be lower than Damage weight. If you have 100% critical chance, it's equivalent to Damage except that it is affected by Critical Resistance.

The most optimal alemental damage/power ratio that you should set can be precisely calculated depending on the spells you're planning to use.

The optimal damage/power ratio follows this formula :  
**100 / average base spell damage.**  
The higher the spell base damage, the less you should put weight in damage.

For example if you only use the **"Decimate" Sacrier spell** : It deals 29 to 32 earth damages, averaging 30.5. The ratio would be **100 / 30.5 = 3.3**.  
If you have a weight of 1 in strength, that means the most optimal Earth Damage weight to set is 3.3.

In general basic 1 line damage spells without additional effects have a damage/power ratio :

- Between 2 and 3 for 4 cost spells
- Between 3 and 4 for 3 cost spells
- Between 4 and 5 for 2 cost spells

Spells with additional effects usually have a lower base damage and so a higher damage/power ratio.

A spell that is a critical has their base damage multiplied by 1.2 in most cases. So the damage/power ratio should be divided by 1.2 if you play a critical build.

Calculating the **Critical Chance weight** is a little bit difficult. It is better to decide beforehand if you want to play Critical, and if so use a Min input instead of Weight or have both a high Weight and a Min input.

## Defense Weights

Flat and elemental resistances weights are synced together if **"Automatic Weight Calculation"** is on.

The percentage/flat elemental resistance ratio is proportional to the damage of the attack you receive.  
It follows this formula : **percentage/flat resistance ratio = damage received / 100**.

- If the damage received is 100 => Ratio is 1 => percentage elemental resistance weight should be equal to the flat weight.
- If the damage received is 300 => Ratio is 3 => percentage elemental resistance weight should be 3 times the flat weight (default weight input)

Most 200 level items don't have flat resistances so it may not be very helpful to set a weight in flat resistances for high level builds.

The sum of percentage elemental resistances weights should be equal to the sum of ranged and melee percentage resistance weights. Having 10% resistance in all elements is equivalent to having 10% in melee and ranged resistances.

However percentage resistance is a characteristic that is stronger the higher it is. I won't go into details why here but basically going from 49% to 50% resistance is almost 2 times stronger than going from 0% to 1% resistance.  
So if you want a build with a lot of elemental resistances you can put more weight into elemental resistances than melee / ranged resistances since they're usually harder to stack. But the sum of elemental resistances should be less than two times the sum of melee / ranged resistances.

## Min / Max

Most characteristics have value that scales up or down depending on how high they are. For example, Prospecting scales down the higher it is. Conversely, flat and percentage resistances scale up the higher they are.  
Also some characteristics value depend on other characteristics. Most notably Critical Damage's value is very affected by Critical Chance's number, and inversely.

That means you could get build results with too much of a characteristic having a lot of value, even though it would have other characteristics lower than alternatives. Or you could get a build with 200 critical damage but 0% critical chance which makes no sense.

The way to mitigate this issue is to set Min and/or Max inputs so that the number of the characteristic stays within a range that doesn't dramatically affect its value (or other characteristics' value).

## Requirements with Min inputs

Requirements for **Vitality, Intelligence, Strength, Chance, Agility and Wisdom** are not taken into account in the best build calculation because these characteristics can be greatly increased after the build is found. However if you specifically want to use an item that has a difficult requirement to fullfill, you can lock the item and set a Min input so that it would only show you results where it is doable to reach the requirement.

For example for the **Gargandyas's Ram** which requires at least **5000 Vitality** at level 200.  
Let's say you want to put **600 points maximum** from your levels in Vitality, and your character already has **100 Vitality bonus** from scrolls. You should then set a Min input of **5000 - 600 - 100 = 4300**. The closest Min input available below is **4200** so just use that. You could also use overmaged items in Vitality to reach the threshold.

---

# Minmaxing

Once you've come up with weights you're confident about, you can run a bigger combination calculation including many more items or item sets in case there is some hidden combination that would be very good. Keep in mind that the lower the item or set's value you add is, the lower chance there is that it finds a better build.

The combination calculation has been optimized very aggressively so if you're willing to wait for a while you can give it an impressive number of items and sets to check for your build.

However if you reach a point where it takes too long to calculate all the combinations you may want to split your search into subsearch. It's pretty much guaranteed that the best builds of any search will include at least one item set. So you could lock the best item sets for your build one by one and run the search for each locked set. This would exclude all combinations where there are no item set in the final build, but requires manual work. Locking two or three items dramatically reduces the amount of combinations so you can afford to include many more items in the selection.

You can also recalculate the best items when you lock different sets and come up with a more accurate selection as explained previously.

## Minmaxing percentage elemental resistances

This is the initial reason why I started this project. I was trying find good builds with 50% in all percentage elemental resistances and realised how hard it is. I got hooked up on improving it again and again and it ended up becoming a much bigger project than I anticipated.

Maximising these characteristics will require many combinations because they are all capped and there are many Pets and even Dofus / Trophies that can increase them, multiplying combinations many times over compared to a search with just a couple of Pets. At the same time, it is also where this application truly shines because it may come up with builds that no one else thought about.

Pets that increase percentage elemental resistances:

**Bwaks, Croum, El Scarador**

- 50 power + 25% resistances Pets (5 in total)
- 50 power + 5% all resistances Pets (1 in total)

These have a high value if you also want power in your build and should probably be included in any combination search where you want high resistances.

**Rhineetles**

- 1 AP + 12% resistances Rhineetle (4 in total)
- 1 AP + 6% + 6% resistances Rhineetle (6 in total)
- 1 AP + other stat + 6% resistances Rhineetle (4 in total)

A little bit less value compared to previous Pets but the AP it gives can make a huge difference and it gives very flexible characteristics. The issue is that you need to add **14 Pets** which would be a really big search. It could be enough to just add the 4 Rhineetle with another stat if you have the need for it, especially since the other stat usually has a higher value than just 6% resistance.

**Seemyools**

- 1 MP + 16% resistances Seemyool (4 in total)
- 1 MP + 8% + 8% resistances Seemyool (6 in total)
- 1 MP + other stat + 8% resistances Seemyool (4 in total)

Same thing as Rhineetles except that the value is a bit better. It is usually easy to reach the MP cap so I would recommend only testing these if you include items that reduce MP or if you have some specific idea in mind.

On top of these Pets, you may want to include a Pet that brings value to your build so that if a build already has all elements capped then it would select that Pet instead. That pet should have a lower value than the resistances Pets otherwise it would prioritise it even if the resistances are not capped. If you have included Rhineetles then you may want to also add another Pet that gives AP for a more accurate comparison.

---

# Final words

I believe that if used correctly, this application is able to find the perfect build for what you need out of the entire database of Dofus items. It takes into account all requirements and all possible combinations of items. The rest depends on how much patience you have to ensure that there is no hidden better combination.

**Happy minmaxing !**
