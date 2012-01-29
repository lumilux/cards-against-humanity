//
//  CardsViewController.m
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/29/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CardsViewController.h"
#import "WhiteCardsViewController.h"
#import "BlackCardsViewController.h"

@implementation CardsViewController
@synthesize cardBar;
@synthesize white;
@synthesize black;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        NSLog(@"init with nib name cards view controller");
        // Custom initialization
        self.white = [[WhiteCardsViewController alloc] initWithNibName:@"WhiteCardsViewController" bundle:nil];
        self.black = [[BlackCardsViewController alloc] initWithNibName:@"BlackCardsViewController" bundle:nil];
        self.cardBar = [[UITabBar alloc] init];
        self.viewControllers = [NSArray arrayWithObjects:self.white,self.black, nil];
//        self.cardsController = [[UITabBarController alloc] init];
//        self.cardsController.viewControllers = [NSArray arrayWithObjects:white, black, nil];
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    //get card Data
    NSLog(@"IN THIS METHOD HERE");
    
    
    //    [self. reloadData];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

@end
