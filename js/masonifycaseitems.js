window.addEventListener('load', function () {
FlexMasonryinit("#caseitems>ul",{
  responsive:true,
  breakpointCols: {
    'min-width: 1200px': 3,
    'min-width: 900px': 2,
  },
  numCols: 2,
  gap: 10
})
});
