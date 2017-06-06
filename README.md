# Spider Chart
### Description
Tableau has no spider chart by default. But there are some cases when it could be very useful.
D3.js however has a very good support for such visualization. The only 'problem' with that is it is too rectengular by default. 

However after a little googling, there is a good solution for this 'problem'. I found this link: https://www.visualcinnamon.com/2015/10/different-look-d3-radar-chart.html 
Look how round it is :D
This chart knows almost everything we need. Basically the only thing we changed here is the background of the charts. 

Now the chart is ready, the next step is give valid data to it. We used the well-known Tableau 'hack' to get data from the Dashboard, and pass it the the chart. 
The chart shows data between 0 and 1. So we had to aggregate some data, to show them correctly. The trick we used was to divide the actual value with the max value of the dataset, this way we got a percentage value, which is now could be on the axis of the spider chart. 

And basically thats all. 

### Technical details
To use this vizualization, you have to replace `tableau.server` to your Tableau Server domain
```html
<!-- IMPORTANT! Replace tableau.server to your Tableau server domain -->
<script src="http://tableau.server/javascripts/api/tableau-2.1.1.min.js"></script>
```