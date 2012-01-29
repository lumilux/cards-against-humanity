//
//  RoomViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface RoomViewController : UITableViewController
{
    NSArray *roomList;   
}
@property (nonatomic, strong) NSArray *roomList;
@end
