# Google Images Reverse Search Downloader

This is a simple script to download images from [Google Images Reverse Search](https://images.google.com/).

Then, it uses [MaxUrl](https://github.com/qsniyg/maxurl/) to get the upscaled version of the image, if available.

### Usage

```
npm i -g pnpm
pnpm install
pnpm start -i /tmp/Mickey.png -o MickeyHD.png
```

# Note

It can happen that Google is a bit capricious, so do not hesitate to restart the script. If the waiting period is exceeded, it is very likely that no image has been found.

The script uses French as the browser language, feel free to add your language, but it should still work anyway :)

----

**FROM**

![Mickey](./images/Mickey.png)

**TO**

![Mickey](./images/MickeyHD.png)
