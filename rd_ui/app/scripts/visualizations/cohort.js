(function () {
    var cohortVisualization = angular.module('redash.visualization');

    cohortVisualization.config(['VisualizationProvider', function(VisualizationProvider) {

      var editTemplate = '<cohort-editor></cohort-editor>';
        var defaultOptions = {
          'timeInterval': 'daily'
        };

        VisualizationProvider.registerVisualization({
            type: 'COHORT',
            name: 'Cohort',
            renderTemplate: '<cohort-renderer options="visualization.options" query-result="queryResult"></cohort-renderer>',
            editorTemplate: editTemplate,
            defaultOptions: defaultOptions
        });
    }]);

    cohortVisualization.directive('cohortRenderer', function() {
        return {
            restrict: 'E',
            scope: {
                queryResult: '='
            },
            template: "",
            replace: false,
            link: function($scope, element, attrs) {
                $scope.$watch('[queryResult && queryResult.getData(), visualization.options.timeInterval ]', function () {
                    if ($scope.queryResult.getData() == null) {

                    } else {
                        var sortedData = _.sortBy($scope.queryResult.getData(),function(r) {
                          return r['date'] + r['day_number']  ;
                        });
                        
                        var grouped = _.groupBy(sortedData, "date");
                        var maxColumns = _.reduce(grouped, function(memo, data){ 
                            return (data.length > memo)? data.length : memo;
                        }, 0);
                        var data = _.map(grouped, function(values, date) {
                           var row = [values[0].total];
                            _.each(values, function(value) { row.push(value.value); });
                            _.each(_.range(values.length, maxColumns), function() { row.push(null); });
                            return row;
                        });

                        var initialDate = moment(sortedData[0].date).toDate(),
                            container = angular.element(element)[0];

                        $scope.visualization.options.timeInterval = $scope.visualization.options.timeInterval || 'daily';

                        var timeLabels = {'daily': 'Day', 'weekly': 'Week', 'monthly': 'Month'};
                        var timeLabel = timeLabels[$scope.visualization.options.timeInterval];

                        Cornelius.draw({
                            initialDate: initialDate,
                            container: container,
                            cohort: data,
                            title: null,
                            timeInterval: $scope.visualization.options.timeInterval,
                            labels: {
                                time: 'Activation ' + timeLabel,
                                people: 'Users'
                            },
                            formatHeaderLabel: function (i) {
                                return  timeLabel + (i - 1);
                            }
                        });
                    }
                });
            }
        }
    });
    cohortVisualization.directive('cohortEditor', function() {
        return {
          restrict: 'E',
          templateUrl: '/views/visualizations/cohort_editor.html'
        }
    });

}());
