'use strict';


var wrap = require('word-wrap');


module.exports = function buildCommit(answers) {

  var maxLineWidth = 100;

  var wrapOptions = {
    trim: true,
    newline: '\n',
    indent:'',
    width: maxLineWidth
  };

  function addScope(scope) {
    if (!scope) return ': '; //it could be type === WIP. So there is no scope

    return '(' + scope.trim() + '): ';
  }

  function addSubject(subject) {
    return subject.trim();
  }

  function addJiraIssues(issues) {
    return issues.trim() + ' ';
  }

  function addJiraSmartCommands(answers) {
    return filter([
      answers.workflow ? '#' + answers.workflow : undefined,
      answers.time ? '#time ' + answers.time : undefined,
      answers.comment ? '#comment ' + answers.comment : undefined,
    ]).join(' ');
  }

  function filter(array) {
    return array.filter(function(item) {
      return !!item;
    });
  }

  function escapeSpecialChars(result) {
    var specialChars = ['\`'];

    specialChars.map(function (item) {
      // For some strange reason, we have to pass additional '\' slash to commitizen. Total slashes are 4.
      // If user types "feat: `string`", the commit preview should show "feat: `\\string\\`".
      // Don't worry. The git log will be "feat: `string`"
      result = result.replace(new RegExp(item, 'g'), '\\\\`');
    });
    return result;
  }

  // Hard limit this line
  var head = (answers.type + addScope(answers.scope) + (answers.useJira === "yes" ? addJiraIssues(answers.issues) : '') + addSubject(answers.subject)).slice(0, maxLineWidth);
  if (answers.useJira === "yes")
  {
    head += addJiraSmartCommands(answers);
  }

  // Wrap these lines at 100 characters
  var body = wrap(answers.body, wrapOptions) || '';
  body = body.split('|').join('\n');

  var breaking = wrap(answers.breaking, wrapOptions);
  var footer = wrap(answers.footer, wrapOptions);

  var result = head;
  if (body) {
    result += '\n\n' + body;
  }
  if (breaking) {
    result += '\n\n' + 'BREAKING CHANGE:\n' + breaking;
  }
  if (footer) {
    result += '\n\nISSUES CLOSED: ' + footer;
  }

  return escapeSpecialChars(result);
};
