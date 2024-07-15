document.addEventListener('DOMContentLoaded', startPicoWatch);

function startPicoWatch() {
  const picoHelpElement = document.getElementById('picoHelp');
  const picoResetButton = document.getElementById('picoReset');
  const picoHelpButton = document.getElementById('picoHelpButton');
  const picoSubmitButton = document.getElementById('picoSubmit');
  const picoInputs = {
    population: document.getElementById('picoPopulation'),
    intervention: document.getElementById('picoIntervention'),
    comparison: document.getElementById('picoComparison'),
    outcome: document.getElementById('picoOutcome')
  };

  document.querySelectorAll('.picosearchoption').forEach(option => {
    option.addEventListener('focus', () => {
      const helpText = getHelpText(option.getAttribute('topic'));
      picoHelpElement.innerHTML = helpText;
    });
  });

  if (picoResetButton) {
    picoResetButton.addEventListener('click', () => {
      Object.values(picoInputs).forEach(input => input.value = '');
      picoHelpElement.innerHTML = '';
    });
  }

  if (picoHelpButton) {
    picoHelpButton.addEventListener('click', () => openPopup('PICO Help', 'help.html'));
  }

  if (picoSubmitButton) {
    picoSubmitButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default form submission
      if (!picoInputs.population.value || !picoInputs.intervention.value) {
        picoHelpElement.innerHTML = '<p style="color: #f44;">Problem/Population and Intervention fields are required</p>';
      } else {
        const edsSearchTerms = {};
        Object.keys(picoInputs).forEach(key => {
          const input = picoInputs[key];
          input.setAttribute('value', input.value); // make values persistent
          edsSearchTerms[key] = input.value;
        });

        const edsSearchExpression = makeEdsSearchExp(edsSearchTerms);
        const edsDatabaseExpression = makeEdsDatabaseExpression();
        window.location.href = `/search/eds?query=${encodeURIComponent(edsSearchExpression)}${edsDatabaseExpression}`;
      }
    });
  }
}

function getHelpText(topic) {
  const helpTexts = {
    'population': '<h5>Patient problem or Population<p>REQUIRED: Identify the <em>patient problem or population. Describe either the patient\'s chief complaint or generalize the patient\'s comparison to a larger population.</p>',
    'intervention': '<h5>Intervention<p>REQUIRED: Include the use of a specific diagnostic test, treatment, adjunctive therapy, medication or recommendation to the patient to use a product or procedure.</p>',
    'comparison': '<h5>Comparison<p>RECOMMENDED: The <em>main alternative you are considering. It should be specific and limited to one alternative choice.</p>',
    'outcome': '<h5>Outcome<p>[OPTIONAL]: Specify the result(s) of what you plan to accomplish, improve or affect and should be measurable. Specific outcomes will yield better search results and allow you to find the studies that focus on the outcomes you are searching for.</p>',
    'default': '<p>Welcome to the PICO searchbox for EDS. Enter P and I (C and O optional) terms, and click Submit</p>'
  };

  return helpTexts[topic] || helpTexts['default'];
}

function openPopup(name, filename, qdata = '') {
  const qData1 = qdata ? `?${qdata}` : '';
  const theSource = `https://widgets.ebscohost.com/prod/simplekey/picoEditor/docs/${filename}${qData1}`;
  const thePopup = window.open(theSource, name, 'height=680,width=580,top=100,left=100,resizable=yes,scrollbars=yes');
  if (thePopup && thePopup.focus) {
    thePopup.focus();
  }
  return false;
}

function makeEdsSearchExp(termsObj) {
  const { population, intervention, comparison, outcome } = termsObj;
  let searchExp = `(${population}) AND (${intervention}`;

  if (comparison) {
    searchExp += ` OR ${comparison}`;
  }

  searchExp += ')';

  if (outcome) {
    searchExp += ` AND (${outcome})`;
  }

  return searchExp;
}

function makeEdsDatabaseExpression() {
  const picoSearch = document.getElementById('picoSearch');
  if (!picoSearch || !picoSearch.dataset.db) return '';

  return picoSearch.dataset.db.split(',').map(db => `&ff[]=ContentProvider:${encodeURIComponent(db.trim())}`).join('');
}
