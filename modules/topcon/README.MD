### CV5000 XML

## nsCommon
# Company, Modelname, MachineNo, ROMVersion, Version, Date, Time, Version
# Patient
No., ID, FirstName, MiddleName, LastName, Sex, Age, DOB, NameJ1, NameJ2
# Duration, DateFormat(D_M_Y)

## nsSBJ:Measure type="SUBJ"
# nsSBJ:RefractionTest
nsSBJ:Type No="1" "2" ... "6"

-> nsSBJ:TypeName = 1-Prescription(Final) 2-Full Correction (manifest, gets in Memory 1), 3-Unaided Data, 4-Objective Data(RM), 5-Current Spectacles(LM or CL), 6-Last Prescription(Old data)
-> nsSBJ:ExamDistance No="1" ... "n"
=> nsSBJ:Distance
=> nsSBJ:RefractionData -> nsSBJ:R/L -> Sph Cyl Axis etc...
# nsSBJ:BinoVisionTest
# nsSBJ:US21test

## nsKM:Measure type="KM"
# nsKM:KM
nsKM:R/L
-> nsKM:List No="1" ... "n" number of measurements
nsKM:R1/R2/Average/Cylinder x n times
-> nsKM:Median
nsKM:R1/R2/Average/Cylinder (1 time)

## nsREF:Measure type="REF"
# nsREF:VD, nsREF:DiopterStep, nsREF:AxisStep, nsREF:CylinderMode
nsREF:REF
-> nsREF:R/L
nsREF:List No="1" ... "n" number of measurements
    nsREF:Sphere/Cylinder/Axis/SE/CataractMode/IOLMode/ConfidenceIndex
nsREF:Median
    nsREF:Sphere/Cylinder/Axis/SE
# nsREF:PD
nsREF:WorkingDistance unit="cm",Distance unit ="mm", Near unit="mm"

## Strategy

* read straight from importCV5000 function
* return a dict { 'RMpath': RMpath, 'machine': machine,'rx' : rx, 'km': km }
* km is configure to take only Median value -> km['count'] <= 2, and nsKM:List is always No=1, and values same as in nsKM:Median
* if rx['count']> 0 construct XML with nsSUBJ:Type with No range(rx['count']) , usually <=6
* loop through dict['rx']['measures'] -> 

