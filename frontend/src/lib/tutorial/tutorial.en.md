# Tutorial

This application is divided into 3 sections :

Weights / Min / Max : define what you want in your build.
Item Selection : Select the items you want to include in the combination calculations.
Builds results : Displays the best combinations of items calculated from the requirements.

# Weights / Min / Max Inputs

Weights are used to calculate the items, item-sets and builds value. Each characteristic is multiplied by its weight (0 if the corresponding weight is not set) to come up with the final value. Only the highest possible characteristics of the items are taken into account. The derived characteristics like lock, dodge, initiative.. are calculated for every item / sets on load. That means you should only put weight in the characteristic if you value its base effect, not its derived characteristics. E.g. only put weight in wisdom if you value the bonus experience it gives.

Min is a hard limitation : if a build's final characteristic is under the input it will be skipped (or build value set to 0).
Max is a soft limitation : if a build's final characteristic is over the input it will cap the characteristic to the max input set, also capping its contribution to the final build's value accordingly.

Click on the weight's characteristic you want in your build to add the default weight value. Adjust it if you have some idea of what you want. Don't worry if you don't, you can come back to it later.

The AP, MP and range min inputs are the most important to set if you know them but you can also use weights or both to compare build options.

Once your weights and min / max inputs are set, click on "Calculate best Items". Also don't forget to set your desired character's level.

# Item Selection

Items with the highest value for each category are displayed in the first column.
If an item belongs to a set it will show the value with the added set value.
Hovering on an item will show its information.
Clicking on an item will add it to the selection.

Item sets with the highest score (explained below) are displayed in the second column.
Hovering on an item set will show its bonuses and value for each item count. The values shown are incremental: it shows how much value or bonus is added for each additional item count.

Top 20 highest score item sets are displayed by default.
If an item belonging to an item set that is not in the top 20 is selected, its item set will be shown anyway at the bottom of the column.
Clicking on "Selected" button next to top 20 will only show the item sets from items that have been selected, regardless of their score.

The third column shows the items that have been selected for each category. All possible combinations of items from this selection will be checked.
At the bottom of the column is shown the amount of combination that will be calculated from the selection, and the estimated time it will take calculated from a default processing speed. (Format is : "K" = Thousand, "M" = Million, "B" = Billion, "T" = Trillion)

Clicking the eye icon next to each item will scroll the view in the other columns to the corresponding item if it is there.

Each selected item can be "locked", meaning that the item will be included in all possible combinations. This can dramatically reduce the amount of combinations. One item of each category can be locked except for rings (2) and dofus (6).

The goal is to select as many good looking items and item sets as possible to include in the combination calculation, while staying under a reasonable amount of combinations so that it doesn't take too long to compute.

For this you have 2 approaches :

- Use the "Quick Selection" button at the top of the column. This will add all items from visible item sets and the item with the highest value without set value from each category (except dofus/trophies).

- Go through each item and each item sets and add them manually if they look good.

Once it's done check the total combinations. Eventually remove the worst item sets if the number is too high. Keep it under let's say 100 million for a first try. Note that there is no particular issue if you calculate billion of combinations, it will just take more time, heat up and slow down your machine.

At the bottom of the first column you can specify if you're planning to have AP, MP or range exos to your build.

Then click on "Calculate best Builds".

While calculating it will display the progress and the speed at which it computes the combinations.
You can click the Save icon next to it to save the processing speed that is used to calculate the time it takes to compute X combinations for future reference.

When the calculation is done, it will show the results in the Builds section.

# Builds

The 500 best results will be displayed in this section, sorted by value. If there was no results fitting the Min requirements it will be left empty.

If a build's characteristic is 0 it is not displayed.
Characteristics are separated in 3 groups : Utility, Offense and Defense. The value that each group adds to the final build's value is shown at the top.

A characteristic that is over the Max input or limited by one of its items requirement is capped to the max input.
A characteristic that is under the Min input is displayed with red background and the build's value is set to 0.

One of the main feature of this section is that you can compare a build. Other builds will show which items and sets differ, and the difference in stat, value and grouped characteristics value.

All requirements from the build are shown under the characteristics. If a requirement overlap another, they will be merged into the more restrictive one. E.g AP < 11 and AP < 10 would be merged into just AP < 10.

If a build doesn't fit a requirement for : Vitality, Strength, Chance, Intelligence and Agility it is displayed with a yellow background.
Other requirements failing are displayed with a red background and the build's value is set to 0.

You can export a build that you like to DofusDB or DofusBook.

The reason for returning so many results is that you can go back to the weights/min/max section and update the inputs if you're not satisfied with the results or want to filter builds with specific characteristic. It will dynamically recalculate all 500 build's values and sort them again. Same thing happens if you update the level or exos.
If you set a more restrictive Min input, builds that don't fit the requirement anymore will have their value set to 0 and be shown at the bottom of the list.

That's useful if you have a selection with many combinations and you want to avoid running the whole calculation again. Note however that a significant input change could mean that better items and sets should be selected. Also some combinations not present in the top 500 could rise to the top with the new inputs.

# "Advanced" features

## Save build

You can save a build that you like. Saved builds are shown in the build section next to "Results". Just like results, the saved builds have their values dynamically updated from Weights, Min, Max, Level and exos inputs.

If you make a new search and one of the saved build is exactly the same as one of the build result, then it will use the saved build's name as its name instead of its rank, making it easy to recognize it.

You can also set one of your saved build to compare to the results of a new search.

## Save search and Share

All the inputs are saved and encoded in the URL. You can copy the URL and paste it in a new tab and slightly modify it so that you can compare two search results.

Saved builds are synced between your tabs / windows so you can use this to make a slightly different search from a new tab, save a build then compare it in the first search without losing your results.

You can save a search in the saved searches box on top of selected items. Just give it a name so that you can easily come back to it e.g. "Panda tank". If you modify a search after you saved it or loaded it, the saved search text will show orange. Save it again so that it shows green.

When you first load the page it will check if the URL matches exactly one of your saved searches and load it if that's the case.

Be aware that saved searches and saved builds are only stored in your browser's local storage, and so they could be deleted if you clear it for some reason.
To make sure you don't lose a saved search you can save the url in your browser's bookmarks.
To make sure you don't lose a build, export it to your prefered Dofus website and save it there. Or you can export it as a new search and save the URL in your bookmarks.

## Item-set scoring and value / item

## Locking to find better sets

## Dofus / Trophies Combinations

## Momore

# Advices

## How to set good inputs

## Select items intelligently
