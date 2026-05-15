# Codex User History

Date: 2026-04-02

- 1.web based
- a web ui project, like simens 840d view, for self defined cnc controller system
- run it for preview
- base with this style, add program edit page, and simulator section, use react or vue or other packs as you wish and judge
- generate a AGENTS.md file for this project, totally driven by codex
- generate a CHANGELOG_ANGENT.md for your changes; generate a LOG_USER.md for my prompt
- can you integrate with stitch?
- stitch.withgoogle.com
- your ui view seems a bit chaos and complex , and i'd like to use one screen page rather than scroll ones ,optimize it
- u need 2 support english/chinese switch; simplify page structure; remove useless AGENTS.md contents like Current Stack; add docs structure; add your role choice for every session starting; update related files as you di something
- run it
- 1.quick control show like float section, called by trigger; 2. program list does not need to be displayed at main page; 3.messages should show latest one or needed count ones, and can be expand or collapse; 4. add tool/offset management pages and tabs; 5.add setting pages, including param settings; 6.MDI seems usless now; 7.optimize main page layouts ; 8. add log history page and tab; 9.quick control/ current message  should work for all pages;10.executing program can be choosen and change by human ;11.optimize simulator
- 1.offsets should be origin-offsets 2.main page should display running program, and running line should be highlight;3. your message display seems ugly; 4. the full layout is not that symmetry, seems ugly, optimize your layout and displays, then  run it
- 1.tabs change to left, can collapse(show icon) and expand(show icon + text); 2. message line is taller, and change to bottom; 3. message expand section show be with full width;4. axis show should be eye-cathing
- update all related files and docs
- try to optimize AGENTS.md ,learning https://github.com/liufang-robot/experimental_gcode_parser/blob/main/AGENTS.md and changelog https://github.com/liufang-robot/experimental_gcode_parser/blob/main/CHANGELOG_AGENT.md and docs https://github.com/liufang-robot/experimental_gcode_parser/tree/main/docs
- page top contents like: Operating area-Machine operation and line things seems useless; running program tag seems useless;Running line / state in main page seems useless; optimize related things
- 1.quick control can be dragged everywhere; 2.left tab collapse/expand should be different from funtion tabs; 3.main page running program section height shouldn't change after view line count changes; 4.origin offset in chinese means 零偏
- quick control feed/spindle overrides cannot drag by cursor now ,fix it;top section:Custom CNC Control Platform

  Machine Screen
  Single-screen CNC HMI for a self-defined controller stack is verbose, remove it and use a logo replace, logo should contain MetaNC
- when left menu collapsed, MetaNC should be litter either, and it is ugly now especially the border
- logo width should sync with left menu width; bottom message should be in single line(remove current message text);expand messages should display in single line as possible; path overview is a bit stupid, add 3d routes
