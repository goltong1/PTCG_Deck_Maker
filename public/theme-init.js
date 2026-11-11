// Apply before styles paint to avoid a light flash on dark-mode reloads.
try{document.documentElement.dataset.theme=localStorage.getItem('ptcg.theme')==='light'?'light':'dark';}
catch{document.documentElement.dataset.theme='dark';}
