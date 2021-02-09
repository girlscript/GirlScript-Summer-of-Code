<img align="right" width="200" height="200" src="images/favicon/favicon.png">

# GirlScript Summer of Code

**Official website repo of GSSoC**

GirlScript Summer of Code is the 3 month long Open Source program during summers conducted by GirlScript Foundation, started in 2018, with an aim to help beginners get started with Open Source Development while encouraging diversity. Throughout the program, participants contribute to different projects under guidance of experienced mentors. Top participants get exciting goodies and opportunities.

## What to do once registrations over?

Once the registrations are over, we should enable the profile field of the header and disable the register field of the header. Alongwith that, we should also be graying out and deactivating the concerned buttons from the home page and updating the text accordingly.

## Updating Website Data

Dynamic data of different pages/sections of the website can be found in the `resource` folder.

Create a new folder for each GSSoC year to store all data related to that GSSoC.  
*Example:* `resource/2020`

Update the section content by editing the corresponding data file:

| Section | File |
| --- | --- |
| Team | `resource/<year>/data_team.js` |
| Project List | `resource/<year>/data_project_list.js` |
| Campus Ambassadors | `resource/<year>/data_campus_ambassadors.js` |
| Leaderboard | `resource/<year>/data_results.js` |
