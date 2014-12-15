# Schema Generator

###About project
This program is used to reduce **ER Model** to **Database Schema**. This program accepts the **ER Model Description script (ERD)**, validates its syntax and sematics. If any error found, error message is displayed. Otherwise **Database Schema** is generated and dispalyed on screen.
###Features
* Reduces ER Model to Schema.
* It can apply 1-1, 1-M, M-N and ISA relationship to entities.
* Multi-Valued attribues are supported.
* Descriptive attributes are supported.
* Automatic attribute name conflict resolution.
* Syntax and semantic errors can be detected in ER Model Description script (ERD).

###How it Works
This is a sample **ER Model Description Script (ERD)**
```
#Faculty:EmailId_pk,name,address,salary, phone_mv;
#Student:EmailId_pk,name,address,grade;
#Course:CourseId_pk,name;
#Person;
%%
@#Faculty:M:1:#Course;
@#Student:M:M:#Course;
@#Person:ISA:#Faculty,#Student;
```
Output of this script will be
```
PERSON {emailid, name, address}
FACULTY {emailid, salary, courseid}
FACULTY_PHONE {emailid, phone}
STUDENT {emailid, grade}
STUDENT_COURSE {emailid, courseid}
COURSE {courseid, name}
```
###Rules for writing ER Model Description (ERD)
* **ER Description Script (ERD)** has two sections seperated by section separator "%%" and the sections are entity defination section and entity relation section. In entity defination section all the entities are defined along with their attributes. In entity relation secion realtion between entities are defined.
* **Entity Name** : Entity name starts with '#' sign. The next character after # sign must be an alphabet after that numbers and underscore "_" are also allowed.
```sh
#MyEntity
#Entity1
#Entity_1
```
* **Attribute Name** : Name of attribute starts with only alphbets but it can have numbers and underscore "_" sign as well from second postion.
* If attribute is key **_pk** is added as suffix.
```sh
rollno_pk
```
* If attribute is multivalued **_mv** is added as suffix.
```sh
phoneno_mv
```
* **Entity Defination** : to define an entity, entity name is given followed by attribute name.
```sh
#ENTITY_NAME:attribute1,arrribute2,attribute3;
```
* **Entity Relation** : Relations between entities can be defined using following syntax.
```sh
@#EntityOne:1:1:#EntityTwo; // For 1-1 Relationship
@#EntityOne:1:M:#EntityTwo; // For 1-M Relationship
@#EntityOne:M:1:#EntityTwo; // For M-1 Relationship
@#EntityOne:M:M:#EntityTwo; // For M-M Relationship
@#EntityOne:ISA:#EntityTwo,#EntityThree,#EntityFour; // For ISA Relationship
```

* Relations can also be have names with descriptive attributes using following syntax.
```sh
@RelationName:#EntityOne:1:1:#EntityTwo; // For 1-1 Relationship without descritive attributes
@RelationName:arrribute1,attribute2_mv:#EntityOne:1:1:#EntityTwo; // For 1-1 Relationship with descritive attributes
@RelationName:#EntityOne:1:M:#EntityTwo; // For 1-M Relationship without descritive attributes
@RelationName:arrribute1,attribute2_mv:#EntityOne:1:M:#EntityTwo; // For 1-M Relationship with descritive attributes
@RelationName:#EntityOne:M:1:#EntityTwo; // For M-1 Relationship without descritive attributes
@RelationName:arrribute1,attribute2_mv:#EntityOne:M:1:#EntityTwo; // For M-1 Relationship with descritive attributes
@RelationName:#EntityOne:M:M:#EntityTwo; // For M-M Relationship without descritive attributes
@RelationName:arrribute1,attribute2_mv:#EntityOne:M:M:#EntityTwo; // For M-M Relationship with descritive attributes
```

## Live Demo
[Click here] to view working model.

[Click here]:http://erd-majorproject01.rhcloud.com/
