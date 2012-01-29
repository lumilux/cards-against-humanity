//
//  RoomViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@class CardsViewController;

@interface RoomViewController : UITableViewController
{
    NSArray *roomList;
    CardsViewController *cardsController;
}
@property (nonatomic, strong) NSArray *roomList;
@property (nonatomic, strong) IBOutlet CardsViewController *cardsController;
@end
