fetch('http://localhost:3000/doctor')
  .then(res => res.text())
  .then(text => {
    const start = text.indexOf('<div id="debug-error">');
    if (start !== -1) {
      const end = text.indexOf('</div>', start);
      console.log('FOUND ERROR:\n', text.substring(start, end));
    } else {
      console.log('NO ERROR FOUND. Response length:', text.length);
    }
  });
