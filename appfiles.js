var resolve = function(file) {
  return __dirname + '/src/js/app/' + file + '.js';
};

module.exports = 
  {
    files: [
      resolve('init'),
      resolve('config'),
      resolve('directives'),
      resolve('factories'),
      resolve('controllers'),
      resolve('foundation_init')
    ]
  }