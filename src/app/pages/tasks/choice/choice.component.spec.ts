import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ChoiceComponent } from './choice.component';

describe('ChoiceTaskComponent', () => {
  let component: ChoiceComponent;
  let fixture: ComponentFixture<ChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
          RouterTestingModule,
          HttpClientTestingModule,
          MatSnackBarModule
      ],
      declarations: [
        ChoiceComponent
      ],
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
    })
  });

  it('should initialize the choice component', () => {
    expect(component).toBeTruthy();
  });

  it('should throw an error when there are too few items', () => {
      const activityList = ['a']
      expect(() => component.generatedRandomActivityPairs(activityList)).toThrowError();
  })

  it('should throw an error if there are non unique strings', () => {
      const activityList = ['a', 'b', 'c', 'c']
      expect(() => component.generatedRandomActivityPairs(activityList)).toThrowError();
  })

  it('should generate random unique activity pairs given the activity list with 5 strings', () => {
      const activityList = [
          "a",
          "b",
          "c",
          "d",
          "e"
      ]

      // check that we get expected number of pairs
      const generatedPairs = component.generatedRandomActivityPairs(activityList);
      expect(generatedPairs.length == activityList.length);

      // check that all pairs are unique
      const mappedPairs = generatedPairs.map(pair => {
          const [first, second] = [pair.activityA, pair.activityB].sort();
          return first + second
      });
      expect(new Set<string>(mappedPairs).size).toEqual(activityList.length);

      // check that each letter appears exactly twice
      const map = new Map<string, number>(activityList.map(x => [x, 2]));
      generatedPairs.forEach(pair => {
          map.set(pair.activityA, map.get(pair.activityA) - 1);
          map.set(pair.activityB, map.get(pair.activityB) - 1);
      })
      map.forEach(element => {
          expect(element).toEqual(0)
      });
  })

  it('should generate random unique activity pairs given the activity list with 6 strings', () => {
    const activityList = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
    ]

    // check that we get expected number of pairs
    const generatedPairs = component.generatedRandomActivityPairs(activityList);
    expect(generatedPairs.length == activityList.length);

    // check that all pairs are unique
    const mappedPairs = generatedPairs.map(pair => {
        const [first, second] = [pair.activityA, pair.activityB].sort();
        return first + second
    });
    expect(new Set<string>(mappedPairs).size).toEqual(activityList.length);

    // check that each letter appears exactly twice
    const map = new Map<string, number>(activityList.map(x => [x, 2]));
    generatedPairs.forEach(pair => {
        map.set(pair.activityA, map.get(pair.activityA) - 1);
        map.set(pair.activityB, map.get(pair.activityB) - 1);
    })
    map.forEach(element => {
        expect(element).toEqual(0)
    });
    console.log(generatedPairs);
    
})

});
