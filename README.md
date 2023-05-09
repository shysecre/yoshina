# yoshina

Simple tool that uses spotify and twitch api to automate song requests via custom rewards on twitch.

# Table on content

1. [How it works](#how-it-works)
2. [How to use it](#how-to-use-it)
3. [Help wanted](#help-wanted)

Leave a ⭐ if you like it :)

# How it works

1. You authorizing with twitch and spotify
2. On first auth app will create custom reward and provide you with link to place where you can edit it
3. Now users can redeem that reward, they must provide correct spotify url for single **track**, not playlist, not album or whatever!
4. App will check if you have open spotify in any device then check for current playback state and depends on it it will add track to queue or instantly play it
5. If error appear during song request (e.g. i'm bad programmer and made somewhere a mistake) app will automatically refund that redeem and user will get his points back
6. If no error appear during song request app will automatically mark that redeem as successful

# How to use it

1. Download repo source code
2. Download node 18.16 (I'm using [nvm](https://github.com/nvm-sh/nvm))
3. Create .env file in root folder, fill it according to example file (.env.example)<br />
3.1. For twitch client & secret thing visit: [dashboard](https://dev.twitch.tv/console/apps) and create new application<br />
3.2. For spotify client & secret thing visit: [dashboard](https://developer.spotify.com/dashboard) and create new application<br />
3.3. IMPORTANT STEP! When creating those applications you need to add redirect url like this one:<br />
  For spotify: `http://localhost:PORT-FROM-.ENV/spotify-auth`<br />
  For twitch: `http://localhost:PORT-FROM-.ENV/twitch-auth`
4. Create folder named data in root folder
5. Run `yarn run:compile && yarn run:ncc`<br />
That will create single js file in ncc folder that you can use to start application. It will be lightweight and easy to move
6. Make sure you have filled .env file and data folder besides newly created index js file
7. Run it using node `node index.js`
8. Don't forget to open spotify when you start app

# Help wanted

Because i'm very bad at regexp i'm searching for someone who can write cool regexp to parse id from spotify url.<br />
Id starts right after `track/` and ending before `?si`<br />
Example url: `https://open.spotify.com/track/1pKYYY0dkg23sQQXi0Q5zN?si=37729c4bbe63445b`<br /><br />
It you want to help create regexp like that, or found a bug feel free to create issue of pull request with fix if you're not lazy to make one, much love 💌
