const firefoxData = [
  {
    featureId: "FF-BM-001",
    title: "Bookmarks Management and Display Interfaces",
    description:
      "The Firefox Bookmarks system must allow users to efficiently store, organize, and access saved web locations using hierarchical folder structures.",
    acceptanceCriteria: [
      "Bookmarks must be consistently accessible from exactly 4 standard UI locations: toplevel Bookmarks menu, Bookmarks toolbar, Sidebar panel, and Manage Bookmarks window.",
      "Visual indicators must be present: green ribbons for bookmarks, folder icons for directories, and solid triangles for submenus.",
      "The system must support the 'Personal Toolbar Folder' and display it with a combined specific icon.",
      "Any addition, deletion, modification, or structural change (drag-and-drop) of a bookmark must instantly synchronize across all 4 standard locations.",
    ],
    groundTruthScenarios: [
      {
        title: "add-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select the toplevel 'Bookmarks' menu then select the first menuitem 'Add Bookmark'.",
        ],
        expectedResult:
          "The title of the page you selected should appear as a bookmark in the toplevel 'Bookmarks' menu, the 'Bookmarks' popup menu on the personal toolbar, the 'Bookmarks' panel in MySidebar, and in the Manage Bookmarks view.",
      },
      {
        title: "file-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Open a link in a new window.",
          "With the new window in front select from the toplevel menu Bookmarks | File Bookmark.",
          "In the folder tree select a folder and click 'OK'.",
        ],
        expectedResult:
          "A dialog should appear with the Name and Location of the current page pre-filled. The bookmark should immediately appear in all 4 standard locations at the specified position within the hierarchy.",
      },
      {
        title: "create-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select File | New Bookmark.",
          "Type in any name and location (URL).",
          "Click Enter.",
        ],
        expectedResult:
          "A dialog box should appear prompting you for the Name and Location. The new bookmark should immediately appear in all 4 standard locations.",
      },
      {
        title: "delete-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select the toplevel 'Bookmarks' menu then select the 'Manage Bookmarks' menuitem.",
          "Select (highlight) a bookmark, press the delete key, OR",
          "Select (highlight) a bookmark, Select Edit | Delete. Click OK in the dialog that appears.",
        ],
        expectedResult:
          "The title of and link to the bookmark should now be removed from all 4 standard locations.",
      },
      {
        title: "add-delete-ptoolbar-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Open the Manage Bookmarks Window.",
          "Edit | Cut or Edit | Copy any bookmark.",
          "Select the 'Personal Toolbar Folder'. Double-click it or single-click the triangle to open the folder.",
          "Select Edit | Paste.",
          "Go to a browser window and click once on the new link in the personal toolbar.",
        ],
        expectedResult:
          "The bookmark added should appear immediately on the personal toolbar in a browser window and be activated by a single click. It should also be present as a subitem under 'Personal Toolbar Folder' in the toplevel menu, popup toolbar, and sidepanel.",
      },
      {
        title: "create-folder",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select any item in your list. Select File | New Folder. Click 'OK'.",
          "Select the folder you just created. Select File | New Folder. Click 'OK'.",
          "Double-click the folder you just created. Select File | New Folder. Click 'OK'.",
        ],
        expectedResult:
          "Folder named 'New Folder' should be created below the selected item. Subsequent folders should nest appropriately (inside or below). All newly created folders should appear with correct hierarchical structure in all 4 standard locations.",
      },
      {
        title: "surf-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select the toplevel 'Bookmarks' menu and select any bookmark.",
          "Click 'Bookmarks' on the Bookmarks/personal toolbar and select any bookmark.",
          "Open the sidebar 'Bookmarks' panel and double-click any bookmark.",
          "From 'Manage Bookmarks' window, double-click any bookmark.",
        ],
        expectedResult:
          "In all cases, the url corresponding to the bookmark you selected should be loaded in the browser window.",
      },
      {
        title: "surf-all-bookmarks",
        preconditions: "You must have the default bookmarks file installed.",
        steps: [
          "Using the Bookmarks menu or the Manage Bookmarks window, select and surf each and every bookmark in turn.",
        ],
        expectedResult:
          "Each bookmark should load completely in the browser window. There should be no 'dead' links.",
      },
      {
        title: "edit-properties",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select a bookmark. Select File | Bookmark Properties. Change Name or Location. Edit Description. Click 'OK'. Surf the link.",
          "Select a folder. Select File | Bookmark Properties. Change Name. Change description. Click 'OK'.",
        ],
        expectedResult:
          "Changes take effect upon pressing 'OK' and are seen in all 4 standard locations. Clicking the new bookmark name should go to the same url, or if url changed, to the new url.",
      },
      {
        title: "delete-folder",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select any folder.",
          "Select Edit|Delete and Click OK, OR Hit the Backspace key, OR Hit the Delete key.",
          "Select 2 or many folders, repeat the deletion step.",
        ],
        expectedResult:
          "For menu deletion, a confirmation dialog appears. After confirming or using keyboard shortcuts, the folder(s) should be immediately deleted. Folders should immediately disappear from all 4 standard locations.",
      },
      {
        title: "show-hide-folder",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Double-click a closed folder.",
          "Click a closed (points right) disclosure triangle.",
          "Double-click an open folder.",
          "Click an open (points down) disclosure triangle.",
        ],
        expectedResult:
          "When opening, the folder's contents should be exposed, icon changes to open, triangle points down. When closing, contents are concealed, icon changes to closed, triangle points right.",
      },
      {
        title: "create-delete-separator",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select a bookmark.",
          "Select File | New Separator.",
          "Select the separator. Select Edit | Delete, click 'OK'.",
        ],
        expectedResult:
          "Separator should immediately appear below the selected item in all 4 standard locations. After deletion, it should immediately disappear from all 4 standard locations.",
      },
      {
        title: "save-state",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Click on disclosure triangles to open/close several folders and remember their state.",
          "Do the same for bookmarks folders in the bookmarks sidepanel.",
          "Quit the browser (alternately, induce a crash).",
          "Launch the browser and open the sidebar and Manage Bookmarks.",
        ],
        expectedResult:
          "The bookmarks tree should have the exact same shape (open/closed folders) in both the Manage Bookmarks window and the sidepanel.",
      },
      {
        title: "view-properties",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select a bookmark. Select File | Bookmark Properties. Verify, click 'OK'.",
          "Select a folder. Select File | Bookmark Properties. Verify, click 'OK'.",
          "Select a separator. Select File | Bookmark Properties.",
        ],
        expectedResult:
          "Bookmark dialog has fields for name, location(url), custom keyword, description, and update options. Folder dialog has fields ONLY for name and description. Separator should show NO dialog.",
      },
      {
        title: "rename-bookmark",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Click a bookmark by single clicking on the name of the bookmark.",
          "Type a new name. Press enter.",
          "Select Edit | Bookmark Properties, look at the name field.",
        ],
        expectedResult:
          "The bookmark name should hilite and become editable inline. The new name you typed should completely replace the old name.",
      },
      {
        title: "custom-keywords",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select a bookmark. Select File | Bookmark Properties.",
          "Enter the word 'blah' in the custom keyword field. Click 'OK'.",
          "In a browser window, type 'blah' into the url field and press enter.",
        ],
        expectedResult:
          "You should be taken to the url associated with the bookmark. The browser should NOT perform an internet keyword search or smart browsing search.",
      },
      {
        title: "sort-columns",
        preconditions:
          "Install a specific bookmarks file (abcdbookmarks.html). Sidebar customized with bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Click on the 'Name' column once, twice, and a third time.",
          "Click on the 'URL', 'Custom Keyword', 'Description', 'Last Visit', 'Added On', and 'Last Modified' columns once, and a second time.",
        ],
        expectedResult:
          "Bookmarks should sort alphabetically, then reverse-alphabetical, then 'natural' order. Other columns sort by their respective values and then reverse. Separators should separate the sort.",
      },
      {
        title: "resize-columns",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Mouseover the separator between the 'Name' and 'URL' columns.",
          "Click and drag that separator to the left and right.",
          "Repeat with other column separators.",
        ],
        expectedResult:
          "Mouse pointer changes to double-arrowed icon. Column sizes shrink/grow. Content moves with header. Obscured content is replaced by ellipsis (...).",
      },
      {
        title: "show-hide-columns",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Click the icon on the far right of the column headers.",
          "Uncheck two of the items (columns).",
          "Recheck an item.",
          "Quit and restart the application.",
        ],
        expectedResult:
          "Popup menu appears listing column headers. Unchecking causes columns to disappear. Rechecking causes them to reappear. Visibility state persists after restart.",
      },
      {
        title: "reorder-item",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select an item already within a folder.",
          "Move cursor (dragging the item) to several positions (up/down).",
          "Drag to another position within the folder and drop.",
          "Repeat for Bookmark, Folder, and separator.",
        ],
        expectedResult:
          "Cursor changes to drag cursor, black line marks drop location. Cursor changes to 'No' symbol over original location. Item immediately moves to new location.",
      },
      {
        title: "reorder-hierarchy",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks tab.",
        steps: [
          "Open MySidebar to the Bookmarks Tab.",
          "Select Bookmarks | Manage Bookmarks (position window so both trees are visible).",
          "Select an item within a folder in Manage Bookmarks.",
          "Drag item to any other position in the hierarchy within the Bookmarks Sidebar Tab and drop.",
        ],
        expectedResult:
          "Drag cursor appears with black line marking drop location. Item immediately moves to new location, instantly reflected in all 4 standard locations.",
      },
      {
        title: "cut-undo-redo-items",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select a bookmark.",
          "Select Edit | Cut.",
          "Select Edit | Undo.",
          "Select Edit | Redo.",
        ],
        expectedResult:
          "Bookmark disappears, then reappears, then disappears again. This cycle must be reflected instantly in all 4 standard locations.",
      },
      {
        title: "copy-paste-items",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select any item. Select Edit | Copy.",
          "Select any item. Select Edit | Paste.",
          "Cycle through the 3 possible choices (bookmark, folder, separator) for copy and paste targets.",
        ],
        expectedResult:
          "Every item should be copyable. The pasted item should appear below the selected item in all 4 standard locations.",
      },
      {
        title: "paste-into-folder",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select any item and Copy.",
          "Select a closed folder and Paste.",
          "Select an open folder and Paste.",
          "Repeat steps attempting to paste a folder into itself.",
        ],
        expectedResult:
          "Items paste below a closed folder. Items paste inside an open folder. Pasting a folder into itself is not allowed. All changes reflected in 4 standard locations.",
      },
      {
        title: "delete-multiple-bookmarks",
        preconditions:
          "You must have a bookmarks file. Sidebar must be customized to include a bookmarks panel.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Select any bookmark. Shift+click or drag to select more (at least 3).",
          "Select Edit | Delete.",
        ],
        expectedResult:
          "The multiple selected bookmarks should no longer appear in any of the 4 standard locations.",
      },
      {
        title: "self-drop",
        preconditions:
          "Bookmarks file containing folder 'A', which contains subfolder 'A1'. Both have bookmarks.",
        steps: [
          "Select Bookmarks | Manage Bookmarks.",
          "Drag folder A1 and drop onto itself.",
          "Drag folder A1 and drop onto folder A.",
          "Drag folder A and drop onto folder A1.",
          "Drag a bookmark within folder A1 and drop it onto folder A1.",
        ],
        expectedResult:
          "Nothing should happen. No bookmark or folder should be moved. The International symbol for 'No' cursor should be displayed.",
      },
    ],
  },
  {
    featureId: "FF-TH-002",
    title: "Theme Installation and Management",
    description:
      "The Firefox Themes system must allow users to customize the visual appearance of the browser, including toolbar color schemes, background images, and menu colors. The system must support default built-in themes (System, Light, Dark, Alpenglow/Classic/Modern) and allow users to install, switch, disable, and manage themes via the preferences and view menus.",
    acceptanceCriteria: [
      "Users must be able to install new themes from the Add-ons manager, which should immediately apply the new visual appearance to the browser.",
      "The system must display the currently active theme and other saved themes in the preferences dialog.",
      "Users must be able to switch between saved themes by enabling them, which must automatically disable the previously active theme.",
      "Theme changes must reflect consistently across all browser components (menu bars, toolbars, floating components) and sub-applications (composer, mail, address book).",
      "Users must be able to access theme switching and the 'Get New Themes' functionality directly from the main View menu.",
    ],
    groundTruthScenarios: [
      {
        title: "accessing-themes-dialog",
        preconditions: "Firefox is running with default settings.",
        steps: [
          "From the main menu bar, select Edit > Preferences > Appearance > Themes.",
        ],
        expectedResult:
          "By default, there should be at least two skins available under Themes (e.g., Classic and Modern).",
      },
      {
        title: "apply-classic-theme",
        preconditions: "Firefox is running. The active theme is not 'Classic'.",
        steps: [
          "From the main menu bar, select Edit > Preferences > Appearance > Themes.",
          "Select 'Classic' theme on the right hand side of the dialog.",
          "Click the 'Apply Classic' button.",
          "Close the Preferences dialog.",
        ],
        expectedResult:
          "The Classic theme is displayed. All menu bars, tool bars, task bars, and widgets are well displayed according to the classic skin without visual artifacts.",
      },
      {
        title: "apply-modern-theme",
        preconditions: "Firefox is running. The active theme is not 'Modern'.",
        steps: [
          "From the main menu bar, select Edit > Preferences > Appearance > Themes.",
          "Select 'Modern' theme on the right hand side of the dialog.",
          "Click the 'Apply Modern' button.",
          "Close the Preferences dialog.",
        ],
        expectedResult:
          "The Modern theme is displayed. All menu bars, tool bars, task bars, and widgets are well displayed according to the modern skin without visual artifacts.",
      },
      {
        title: "verify-theme-consistency-across-apps",
        preconditions:
          "Firefox is running with a specific theme applied (e.g., Classic or Modern).",
        steps: [
          "Click through all the items on menu bars, tool bars, and floating component bars in the main browser window.",
          "Open other applications under the browser suite like composer, mail, news, aim, and address book.",
          "Click through all the items on menu bars and tool bars in these sub-applications.",
        ],
        expectedResult:
          "All selectable items and icons should work as advertised. The look and feel of the applied theme must be completely consistent across the main browser and all sub-applications.",
      },
      {
        title: "apply-theme-via-view-menu",
        preconditions: "Firefox is running.",
        steps: [
          "From the main menu bar, select View.",
          "Select 'Apply Theme' to open the popup submenu.",
          "Check to see if the available themes appear.",
          "Select a specific theme item (e.g., 'Classic Theme' or 'Modern Theme').",
        ],
        expectedResult:
          "The submenu should successfully display the available themes. Upon selecting a theme, the browser menu bar and interface should immediately update to reflect the newly selected skin.",
      },
      {
        title: "theme-preferences-via-view-menu",
        preconditions: "Firefox is running.",
        steps: [
          "From the main menu bar, select View.",
          "Select 'Apply Theme' to open the popup submenu.",
          "Select 'Theme Preferences...'.",
        ],
        expectedResult:
          "The Theme Preferences dialog window should appear correctly.",
      },
      {
        title: "get-new-themes-via-view-menu",
        preconditions:
          "Firefox is running and has an active internet connection.",
        steps: [
          "From the main menu bar, select View.",
          "Select 'Apply Theme' to open the popup submenu.",
          "Select the 'Get New Themes' item.",
        ],
        expectedResult:
          "The browser should open a new tab or window and link to the official themes download repository (e.g., mozilla.org/themes/download/).",
      },
    ],
  },
  {
    featureId: "FF-PW-003",
    title: "Password Manager and Authentication UI",
    description:
      "The Firefox Password Manager system must securely handle user authentication data, streamline the login process, and provide an intuitive interface for managing stored credentials. The system must eliminate intrusive modal dialogs (replacing them with notification bars) and improve the management and discoverability of multiple accounts on the same site. It is a strict architectural requirement that the browser must only prompt the user to save a password AFTER confirming that the login was successful.",
    acceptanceCriteria: [
      "The system must ONLY prompt the user to save a password after the login process has succeeded (to prevent saving incorrect credentials).",
      "The prompt to save or remember a password must be presented as a non-intrusive notification bar (replacing modal dialogs), which can be dismissed or undone.",
      "The system must support saving, editing, filtering, and searching stored passwords within a dedicated 'Show Passwords' management window.",
      "The system must gracefully handle multiple logins for the same hostname, allowing the user to select the appropriate account (e.g., via a dropdown in the username field).",
      "The system must provide an option to never remember passwords for specific sites ('Never for this site' exception).",
      "The password management UI must primarily display the hostname (e.g., without 'http://') to simplify visual scanning, while maintaining secure-only indicators where necessary.",
    ],
    groundTruthScenarios: [
      {
        title: "save-and-view-password",
        preconditions:
          "Password manager is enabled. The user does not have saved credentials for the target site (e.g., www.ebay.com).",
        steps: [
          "Go to a site requiring authentication (e.g., www.ebay.com) that has not been visited before.",
          "Enter a valid username and password, then submit the login form.",
          "Wait for the login process to succeed.",
          "When the notification bar appears asking to save the password, choose to save it.",
          "Navigate to the browser's Preferences/Options -> Advanced -> Passwords.",
          "Click 'View saved passwords'.",
        ],
        expectedResult:
          "The notification bar to save the password MUST NOT appear until the login succeeds. After saving, the 'View saved passwords' window must display the saved username and password for the correct hostname.",
      },
      {
        title: "never-remember-password",
        preconditions:
          "Password manager is enabled. The user does not have saved credentials for the target site (e.g., www.freeride.com).",
        steps: [
          "Go to a site requiring authentication.",
          "Enter a valid username and password, then submit the login form.",
          "When the notification bar appears asking to save the password, select 'Never for this site'.",
          "Restart the browser and return to the same site.",
        ],
        expectedResult:
          "No password should be saved in the Password Manager. The username and password fields must NOT be prefilled. The prompt to save the password must NOT appear again for this site.",
      },
      {
        title: "decline-save-password-once",
        preconditions:
          "Password manager is enabled. The user does not have saved credentials for the target site.",
        steps: [
          "Go to a site requiring authentication.",
          "Enter a valid username and password, then submit the login form.",
          "When the notification bar appears asking to save the password, select 'No' (or simply dismiss/ignore the bar).",
          "Restart the browser and return to the same site.",
          "Enter a username and password and submit the form again.",
        ],
        expectedResult:
          "No password should be saved. The username and password fields must NOT be prefilled. The prompt to save the password MUST appear again upon the next successful login.",
      },
      {
        title: "disable-password-manager-globally",
        preconditions:
          "Password manager is currently enabled and contains at least one saved credential.",
        steps: [
          "Navigate to Preferences -> Advanced -> Passwords.",
          "Uncheck/disable the option 'Remember passwords for sites that require me to log in'.",
          "Navigate to a site where credentials were previously saved.",
        ],
        expectedResult:
          "The username and password fields must NOT be prefilled. The system must NOT prompt to save new passwords on any site while the feature is disabled globally.",
      },
      {
        title: "handle-multiple-usernames-for-same-site",
        preconditions:
          "Password manager is enabled. The user has at least two distinct accounts for the target site (e.g., mail.yahoo.com).",
        steps: [
          "Navigate to the target site, log in with the FIRST account, and save the password.",
          "Log out, return to the login page, clear any prefilled data.",
          "Log in with the SECOND account and save the password.",
          "Restart the browser and return to the target site.",
        ],
        expectedResult:
          "Both sets of credentials must be saved in the Password Manager. Upon returning to the site, the browser must present a dropdown UI (or similar visual cue) in the username field allowing the user to select between the two saved accounts.",
      },
      {
        title: "update-existing-password",
        preconditions:
          "Password manager is enabled and contains saved credentials for a site.",
        steps: [
          "Using a different browser or device, change the password for the account.",
          "In the test browser, navigate to the site.",
          "Delete the prefilled outdated password and enter the NEW password.",
          "Submit the login form.",
          "When prompted by the notification bar to update the password, accept it.",
          "Restart the browser and return to the site.",
        ],
        expectedResult:
          "The Password Manager must successfully overwrite the old password with the new one. Upon returning, the new password must be prefilled correctly.",
      },
      {
        title: "view-and-remove-never-saved-exceptions",
        preconditions:
          "Password manager is enabled. The user has marked at least one site as 'Never for this site'.",
        steps: [
          "Navigate to Preferences -> Advanced -> Passwords -> View stored passwords.",
          "Switch to the 'Passwords never saved' (Exceptions) tab.",
          "Verify the presence of the exempted site.",
          "Select the site and click 'Remove'.",
          "Click 'OK' or close the manager.",
        ],
        expectedResult:
          "The site must be listed in the Exceptions tab. After removal, the site must no longer appear on the 'Never saved' list, meaning the browser WILL prompt to save passwords for that site upon the next successful login.",
      },
      {
        title: "remove-all-saved-passwords",
        preconditions:
          "Password manager is enabled and contains multiple saved credentials.",
        steps: [
          "Navigate to Preferences -> Advanced -> Passwords -> View stored passwords.",
          "Click the 'Remove all' button.",
          "Confirm the deletion if prompted.",
        ],
        expectedResult:
          "All saved site and username information must be permanently removed from the list. Returning to any previously saved site must not result in autofilled credentials.",
      },
    ],
  },
  {
    featureId: "FF-HI-004",
    title: "Browser History Tracking and Management",
    description:
      "The Firefox Browser History system must reliably track and store every user page visit using a robust database architecture. It must provide querying capabilities by date ranges, support complex grouping (such as by domains and browsing sessions/transitions), and display favicons for visual differentiation. The system must also support keyword searching over page titles and ensure rapid link coloring without degrading page load performance.",
    acceptanceCriteria: [
      "The system must record every individual visit to a page, including the transition type (e.g., typed, link clicked), rather than just overwriting the last visit time.",
      "Users must be able to view their browsing history filtered by specific date ranges.",
      "The history view must visually differentiate pages by displaying their corresponding favicons and grouping them logically by domain or session.",
      "Users must be able to perform keyword searches over the titles of all visited pages.",
      "The system must accurately track and resolve page redirects so that the final destination is correctly logged in history.",
      "The system must maintain fast visited-link coloring performance (e.g., by caching recent URLs in memory) without requiring a hard database lock for every link on a page.",
    ],
    groundTruthScenarios: [
      {
        title: "record-global-history-and-redirects",
        preconditions: "Browser is installed and has a clean history.",
        steps: [
          "Browse to several standard web pages.",
          "Click a link that triggers a server-side redirect (e.g., waits 15 seconds then loads a different URL).",
          "Select Go | History (or open the Global History Window).",
          "Quit and restart the browser, then open the Global History Window again.",
        ],
        expectedResult:
          "The History window must be populated with the visited sites. For the redirect, ONLY the final destination URL should be logged in the history, NOT the intermediate redirect URL. The global history must persist across browser restarts.",
      },
      {
        title: "manage-and-clear-global-history",
        preconditions: "Global history contains multiple recorded links.",
        steps: [
          "Open the Global History Window.",
          "Select a single history entry and delete it (via Delete key or Edit | Delete).",
          "Select multiple history entries (using Shift+click) and delete them.",
          "Navigate to Preferences -> Privacy/History Panel and click 'Clear History'.",
          "Return to the Global History Window.",
        ],
        expectedResult:
          "Individual and multiple deletions must immediately remove the entries from the window and persist after a restart. The 'Clear History' action must completely empty all individual history items from the database.",
      },
      {
        title: "history-window-grouping-and-sorting",
        preconditions:
          "Global history contains a rich dataset of visited links across different days and domains.",
        steps: [
          "In the Global History window, select View | Group By | Day.",
          "Change the view to View | Group By | Site.",
          "Change the view to View | Group By | None.",
          "Click on column headers (Title, Location, Last Visited) multiple times to toggle sorting.",
          "Resize columns by dragging separators, and hide/show columns using the column header menu.",
        ],
        expectedResult:
          "Grouping by Day must organize links into time-based folders (Today, Yesterday, etc.). Grouping by Site must organize by domain name. Sorting must toggle between alphabetical, reverse-alphabetical, and natural order. Columns must be freely resizable and hideable, with state persisting across restarts.",
      },
      {
        title: "session-history-navigation",
        preconditions:
          "Open a new, clean browser window or tab (session history is empty).",
        steps: [
          "Verify the 'Go' menu is empty and Back/Forward buttons are inactive.",
          "Navigate sequentially through 4 different web pages.",
          "Click the browser 'Back' button twice.",
          "Open the dropdown menu from the 'Forward' button and select a specific page.",
          "Select a specific page from the 'Go' menu history list.",
        ],
        expectedResult:
          "The Go menu and Back/Forward dropdowns must dynamically populate with the session's page titles. Selecting an item from any of these menus must successfully load the corresponding page. Navigating to a new page from a past state must truncate the 'Forward' history.",
      },
      {
        title: "frame-and-anchor-history-tracking",
        preconditions:
          "Navigate to a page containing internal anchor links (#) or distinct frame states.",
        steps: [
          "Click on several internal anchor links within the same page (e.g., #purpose, #steps).",
          "Click the browser 'Back' and 'Forward' buttons.",
          "Open the Global History Window.",
        ],
        expectedResult:
          "The browser must scroll to the correct anchors, and the URL must update. The Back/Forward buttons must step through the anchor states. The Global History window must list each named anchor URL as a distinct, separate entry.",
      },
    ],
  },
];

module.exports = firefoxData;
