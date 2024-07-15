jQuery(document).ready(() => {
  startPicoWatch();
});


function startPicoWatch() {
  jQuery('.picosearchoption').on('focus', function () {
    const helpText = getHelpText(jQuery(this).attr('topic'));
    jQuery('#picoHelp').html(helpText);
  });

  jQuery('#picoReset').on('click', () => {
    jQuery('#picoPopulation, #picoIntervention, #picoComparison, #picoOutcome').val('');
    jQuery('#picoHelp').html('');
  });

  jQuery('#picoHelpButton').on('click', () => {
    openPopup('PICO Help', 'help.html');
  });

  jQuery('#picoSubmit').on('click', (e) => {
    // trap required fields
    if ((jQuery('#picoPopulation').val() === '') || (jQuery('#picoIntervention').val() === '')) {
      jQuery('#picoHelp').html('<p style="color: #f44;">Problem/Population and Intervention fields are required');
    } else {
      // proceed w/ the search
      const edsSearchTerms = {};
      const picoInputs = jQuery('#picoPopulation, #picoIntervention, #picoComparison, #picoOutcome');
      jQuery.each(picoInputs, function (x, y) {
        jQuery(this).attr('value', jQuery(this).val()); // make values persistent
        edsSearchTerms[jQuery(this).attr('topic')] = (jQuery(this).val());
      });
      const edsSearchExpression = makeEdsSearchExp(edsSearchTerms);
      const edsDatabaseExpression = makeEdsDatabaseExpression();
      window.location.href = `/search/eds?query=${encodeURIComponent(edsSearchExpression)}${edsDatabaseExpression}`;
    }
  });

  // jQuery('.picosearchoption').on('focusout', () => {
  //   jQuery('#picoHelp').html('');
  // });
}

function getHelpText(topic) {
  switch (topic) {
  case 'population':
    return '<h5>Patient problem or Population<p>REQUIRED : Identify the <em>patient problem or population. Describe either the patient&apos;s chief complaint or generalize the patient&apos;s comparison to a larger population.';
    break;
  case 'intervention':
    return '<h5>Intervention<p>REQUIRED : Include the use of a specific diagnostic test, treatment, adjunctive therapy, medication or recommendation to the patient to use a product or procedure.';
    break;
  case 'comparison':
    return '<h5>Comparison<p>RECOMMENDED : The <em>main alternative you are considering. It should be specific and limited to one alternative choice.';
    break;
  case 'outcome':
    return '<h5>Outcome<p>[OPTIONAL] : Specify the result(s) of what you plan to accomplish, improve or affect and should be measurable. Specific outcomes will yield better search results and allow you to find the studies that focus on the outcomes you are searching for.';
    break;
  default:
    return '<p>Welcome to the PICO searchbox for EDS. Enter P and I (C and O optional) terms, and click Submit';
  }
}

function openPopup(name, filename, qdata = '') {
  let qData1 = '';
  qData1 = (qdata !== '') ? qData1 = `?${qdata}` : '';
  const theSource = `https://widgets.ebscohost.com/prod/simplekey/picoEditor/docs/${filename}${qData1}`;
  const thePopup = window.open(theSource, name, 'height=680,width=580,top=100,left=100,resizable=yes,scrollbars=yes');
  if (window.focus) {
    thePopup.focus();
  }
  return false;
}

function makeEdsSearchExp(termsObj) {
  /* updated to change construction of search expression
    * was "problem" AND "intervention" OR "comparison" "outcome"
    * is now (problem) AND (intervention OR comparison) AND (outcome)
  */
  let searchExp = `(${termsObj.population})`;
  searchExp += ' AND ';

  if (termsObj.comparison !== '') {
    searchExp += `(${termsObj.intervention} OR ${termsObj.comparison})`;
  } else {
    searchExp += `(${termsObj.intervention})`;
  }

  if (termsObj.outcome !== '') {
    searchExp += `${' AND ' + '('}${termsObj.outcome})`;
  }

  return searchExp;
}

function makeEdsDatabaseExpression() {
  const databases = jQuery('#picoSearch').data('db').split(',');
  if (databases.length === 0) {
    return '';
  }
  let returnValue = '';
  databases.forEach(element => {
    returnValue += `&ff[]=ContentProvider:${encodeURIComponent(element.trim())}`;
  });
  return returnValue;
}