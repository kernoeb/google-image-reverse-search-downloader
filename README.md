# Google Images Reverse Search Downloader

This is a simple script to download images from [Google Images Reverse Search](https://images.google.com/).

Then, it uses [MaxUrl](https://github.com/qsniyg/maxurl/) to get the upscaled version of the image, if available.

### Usage

```
npm i -g pnpm
pnpm install
pnpm start -i /tmp/Mickey.png -o MickeyHD.png
```

# Language

Only French is supported for now, but feel free to add your own language in the main script.

Don't forget to make a pull request if you want to share your work :)

----

**FROM**

![Mickey](./images/Mickey.png)

**TO**

![Mickey](./images/MickeyHD.png)
