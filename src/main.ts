import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin

// Register Chart.js components and the zoom plugin
Chart.register(...registerables, zoomPlugin); // Register both the core and the plugin

let chartInstance: Chart | null = null;


// Function to render the graph
const renderGraph = (labels: string[], mainsA: number[], mainsB: number[], mainsC: number[], maxSum: number): void => {
  const ctx = document.getElementById('chart') as HTMLCanvasElement;

  // Destroy existing chart instance if it exists
  if (chartInstance !== null) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(ctx, {
    type: 'line', // Line chart
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Mains A (kWhs)',
          data: mainsA,
          borderColor: 'red',  // Color for the Mains_A line
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Mains B (kWhs)',
          data: mainsB,
          borderColor: 'blue',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Mains C (kWhs)',
          data: mainsC,
          borderColor: 'green',
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,  // Disable aspect ratio to fit the container size
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy', // Pan in both x and y directions
          },
          zoom: {
            wheel: {
              enabled: true, // Enable zooming with mouse wheel
            },
            pinch: {
              enabled: true, // Enable pinch zooming on touch devices
            },
          },
        },
      },
      scales: {
        x: {          
          title: {
            display: true,
            text: 'Timestamp',
          },
          ticks: {
            maxTicksLimit: 20, // Show fewer points initially
          },
        },
        y: {
          title: {
            display: true,
            text: 'kWhs',
          },
          ticks: {
            maxTicksLimit: 20, // Show fewer ticks initially on Y-axis
          },
        },
      },
    },
  });

  // Display the maximum sum on the page
  const maxSumElement = document.getElementById('max-sum') as HTMLElement;
  maxSumElement.textContent = `Max Sum of Mains A, B, C: ${maxSum.toFixed(4)} kWhs`;

  document.getElementById('reset-zoom')?.addEventListener('click', () => {
    if (chartInstance) {
      chartInstance.resetZoom();  // Reset zoom and pan
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
