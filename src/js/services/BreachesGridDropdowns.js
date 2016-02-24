"use strict";

var _ = require("lodash");
var angular = require("angular");

var app = angular.module("cpms.services");

app.factory("BreachesGridDropdowns", [ "TrustData", function(TrustData) {
	function BreachesGridDropdowns($scope) {
		this.$scope = $scope;
	}

	BreachesGridDropdowns.prototype = {
		init: function() {
			this.initHospitalDropdown();
			this.initSpecialtyDropdown();
			this.initClinicianDropdown();
		},

		getHospitalDropdownDefaultValues: function() {
			return [
				{ name: "All hospitals", id: null },
			];
		},

		getSpecialtyDropdownDefaultValues: function() {
			return [
				{ name: "All specialties", id: null },
			];
		},

		getClinicianDropdownDefaultValues: function() {
			return [
				{ name: "All clinicians", id: null },
			];
		},

		initHospitalDropdown: function() {
			var that = this;

			this.$scope.hospitals = this.getHospitalDropdownDefaultValues();
			this.$scope.selectedHospital = this.$scope.hospitals[0];

			TrustData.getHospitals(function(hospitals) {
				that.$scope.hospitals = that.getHospitalDropdownDefaultValues().concat(hospitals);
				that.$scope.selectedHospital = that.$scope.hospitals[0];
			});

			this.$scope.onHospitalDropdownChange = function() {
				var hospital = that.$scope.selectedHospital;
				if (hospital.id !== null) {
					TrustData.getSpecialtiesPerHospital(hospital.id, function(specialties) {
						that.$scope.specialties = that.getSpecialtyDropdownDefaultValues().concat(specialties);
						that.$scope.selectedSpecialty = that.$scope.specialties[0];
						that.$scope.specialtyDropdownDisabled = false;
					});
					that.$scope.setHospital(hospital.name);
				} else {					
					that.$scope.setHospital();
				}

				that.resetSpecialtyDropdown();
				that.resetClinicianDropdown();
			};
		},

		resetSpecialtyDropdown: function() {
			this.$scope.specialties = this.getSpecialtyDropdownDefaultValues();			
			this.$scope.selectedSpecialty = this.$scope.specialties[0];
			this.$scope.specialtyDropdownDisabled = true;

			this.setGridSpecialtySearchValue();
		},

		initSpecialtyDropdown: function() {
			var that = this;

			this.resetSpecialtyDropdown();

			this.$scope.onSpecialtyDropdownChange = function() {
				var specialty = that.$scope.selectedSpecialty;

				if (specialty.id !== null) {
					that.setGridSpecialtySearchValue(specialty.name);

					TrustData.getCliniciansPerSpecialty(that.$scope.selectedHospital.id, specialty.id, function(clinicians) {
						that.$scope.clinicians = that.getClinicianDropdownDefaultValues().concat(clinicians);
						that.$scope.selectedClinician = that.$scope.clinicians[0];
						that.$scope.clinicianDropdownDisabled = false;
					});
				} else {
					that.setGridSpecialtySearchValue();					
				}

				that.resetClinicianDropdown();
			};
		},

		resetClinicianDropdown: function() {
			this.$scope.clinicians = this.getClinicianDropdownDefaultValues();
			this.$scope.selectedClinician = this.$scope.clinicians[0];
			this.$scope.clinicianDropdownDisabled = true;

			this.setGridClinicianSearchValue();
		},

		initClinicianDropdown: function() {
			var that = this;

			this.resetClinicianDropdown();

			this.$scope.onClinicianDropdownChange = function() {
				var clinician = that.$scope.selectedClinician;

				if (clinician.id !== null) {
					that.setGridClinicianSearchValue(clinician.searchName);
				} else {
					that.setGridClinicianSearchValue();
				}
			};
		},

		setSpecialty: function(hospitalId, specialtyId) {
			var that = this;

			var hospital = _.find(this.$scope.hospitals, { "id": hospitalId });
			this.$scope.selectedHospital = hospital;
			this.$scope.setHospital(hospital.name);

			TrustData.getSpecialtiesPerHospital(hospital.id, function(specialties) {
				that.$scope.specialties = that.getSpecialtyDropdownDefaultValues().concat(specialties);
				var specialty = _.find(that.$scope.specialties, { "id": specialtyId });
				that.$scope.selectedSpecialty = specialty;
				that.$scope.specialtyDropdownDisabled = false;

				that.setGridSpecialtySearchValue(specialty.name);

				that.resetClinicianDropdown();
			});
		},

		setClinician: function(hospitalId, specialtyId, clinicianId) {
			var that = this;

			var hospital = _.find(this.$scope.hospitals, { "id": hospitalId });
			this.$scope.selectedHospital = hospital;
			this.$scope.setHospital(hospital.name);

			TrustData.getSpecialtiesPerHospital(hospital.id, function(specialties) {
				that.$scope.specialties = that.getSpecialtyDropdownDefaultValues().concat(specialties);
				var specialty = _.find(that.$scope.specialties, { "id": specialtyId });
				that.$scope.selectedSpecialty = specialty;
				that.$scope.specialtyDropdownDisabled = false;

				that.setGridSpecialtySearchValue(specialty.name);

				TrustData.getCliniciansPerSpecialty(hospital.id, specialty.id, function(clinicians) {
					that.$scope.clinicians = that.getClinicianDropdownDefaultValues().concat(clinicians);
					var clinician = _.find(that.$scope.clinicians, { "id": clinicianId });
					that.$scope.selectedClinician = clinician;
					that.$scope.clinicianDropdownDisabled = false;

					that.setGridClinicianSearchValue(clinician.searchName);
				});
			});
		},

		setGridSpecialtySearchValue: function(value) {
			value = value || "";
			this.$scope.gridColumns.specialty.searchValue = value;
		},

		setGridClinicianSearchValue: function(value) {
			value = value || "";
			this.$scope.gridColumns.clinician.searchValue = value;
		},
	};

	return BreachesGridDropdowns;
}]);