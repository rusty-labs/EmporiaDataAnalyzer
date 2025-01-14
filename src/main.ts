import Papa from 'papaparse';
import * as echarts from 'echarts';

let chartInstance: echarts.ECharts | null = null;

// Function to render the graph
const renderGraph = (labels: string[], mainsA: number[], mainsB: number[], mainsC: number[], maxSum: number): void => {
  const chartContainer = document.getElementById('chart') as HTMLElement;

  // Initialize ECharts
  if (chartInstance === null) {
    chartInstance = echarts.init(chartContainer, {
      renderer: 'svg',
    });
  }

  // Set the chart options
  chartInstance.setOption({
    large: true,
    largeThreshold: 1000,
    title: {
      text: `Max Sum of Mains A, B, C: ${maxSum.toFixed(4)} kWhs`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Mains A (kWhs)', 'Mains B (kWhs)', 'Mains C (kWhs)'],
      top: 'bottom',
    },
    xAxis: {
      type: 'category',
      data: labels,
      name: 'Timestamp',
      nameLocation: 'middle',
      nameGap: 25,
    },
    yAxis: {
      type: 'value',
      name: 'kWhs',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [
      {
        name: 'Mains A (kWhs)',
        type: 'bar',
        data: mainsA,
        itemStyle: { color: 'red' },
      },
      {
        name: 'Mains B (kWhs)',
        type: 'bar',
        data: mainsB,
        itemStyle: { color: 'green' },
      },
      /*
            {
              type: 'custom',
              data: mainsC,
              renderItem: (params: any, api: any) => {
                // Access data
                const x = api.value(0);
                const y = api.value(1);
      
                // Create a Three.js geometry for the bar (rectangular prism)
                const geometry = new THREE.BoxGeometry(1, 1, 1); // Bar size can be adjusted here
                const material = new THREE.MeshBasicMaterial({ color: 0xff5733 });
                const mesh = new THREE.Mesh(geometry, material);
      
                // Position the bar based on the data
                mesh.position.set(x, y, 0);
      
                // Add bar to the scene
                params.context.scene.add(mesh);
      
                // Return empty object because ECharts handles rendering
                return {};
              },
            }
      */

      {
        name: 'Mains C (kWhs)',
        type: 'bar',
        data: mainsC,
        itemStyle: { color: 'blue' },
      },
    ],
    dataZoom: [
      {
        type: 'slider', // Zoom slider on the bottom
        xAxisIndex: 0,
      },
      {
        type: 'inside', // Zoom with mouse wheel
        xAxisIndex: 0,
      },
    ],
  });

  // Display the maximum sum on the page
  const maxSumElement = document.getElementById('max-sum') as HTMLElement;
  maxSumElement.textContent = `Max Sum of Mains A, B, C: ${maxSum.toFixed(4)} kWhs`;

  document.getElementById('reset-zoom')?.addEventListener('click', () => {
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: 'dataZoom',
        start: 0, // Reset the zoom to the start
        end: 100, // Reset the zoom to the end
      });
    }
  });



};

// Function to parse large CSV files efficiently using PapaParse
const parseCSVWithPapa = (file: File): void => {
  const labels: string[] = [];
  const mainsA: number[] = [];
  const mainsB: number[] = [];
  const mainsC: number[] = [];

  let maxSum = 0;

  // Using PapaParse to read the CSV file incrementally
  Papa.parse(file, {
    header: true, // Parse headers
    dynamicTyping: true, // Automatically convert numbers
    step: (result) => {
      const row = result.data as { [key: string]: string | number };  // Type the row as an object with string keys

      // Dynamically find columns based on the headers
      const timestamp = row[Object.keys(row)[0]]; // Assuming the first column is the timestamp
      const mainsAValue = findColumnValue(row, 'Mains_A');
      const mainsBValue = findColumnValue(row, 'Mains_B');
      const mainsCValue = findColumnValue(row, 'Mains_C');

      // Only process the row if the relevant values exist
      if (mainsAValue !== undefined && mainsBValue !== undefined && mainsCValue !== undefined) {
        labels.push(timestamp as string);
        mainsA.push(mainsAValue);
        mainsB.push(mainsBValue);
        mainsC.push(mainsCValue);

        // Calculate current row sum, skipping NaN values
        let currentSum = 0;
        if (!isNaN(mainsAValue)) currentSum += mainsAValue;
        if (!isNaN(mainsBValue)) currentSum += mainsBValue;
        if (!isNaN(mainsCValue)) currentSum += mainsCValue;

        // Update maxSum if needed
        if (currentSum > maxSum) {
          maxSum = currentSum;
        }
      }
    },
    complete: () => {
      // Once parsing is complete, render the chart
      renderGraph(labels, mainsA, mainsB, mainsC, maxSum);
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error.message);
    }
  });
};

// Helper function to find the column value for Mains_A, Mains_B, or Mains_C
const findColumnValue = (row: { [key: string]: string | number }, keyword: string): number | undefined => {
  // Iterate over the row keys and look for columns that contain the keyword
  for (let key in row) {
    if (row.hasOwnProperty(key) && key.includes(keyword)) {
      return row[key] as number; // Return the value if it contains the keyword
    }
  }
  return undefined; // Return undefined if the column is not found
};

// Set up file upload
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    parseCSVWithPapa(file);
  }
});


