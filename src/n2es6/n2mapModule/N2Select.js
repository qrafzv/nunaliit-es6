/**
 * @module n2es6/n2mapModule/N2Select
 */

import {getUid} from 'ol/util.js';
import {default as Interaction} from 'ol/interaction/Interaction.js';
import {singleClick, never, shiftKeyOnly, pointerMove} from 'ol/events/condition.js';
import Event from 'ol/events/Event.js';

const N2SelectEventType = {
	/**
	 * Triggered when features has been (de)selected.
	 * @event N2SelectEvent#hover
	 * @api
	 */
	HOVER : 'hover',
	/**
	 * Triggered when features has been (de)selected.
	 * @event N2SelectEvent#clicked
	 * @api
	 */
	CLICKED : 'clicked',
	/**
	 * Triggered when features has been (de)selected.
	 * @event N2SelectEvent#focus
	 */
	FOCUS : 'focus',
	/**
	 * Triggered when features has been (de)selected.
	 * @event N2SelectEvent#find
	 * @api
	 */
	FIND : 'find'
}
/**
 * @classdesc
 * @extends Event
 */
class N2SelectEvent extends Event {

	/**
	 * [constructor description]
	 * @param {N2SelectEventType} type            [description]
	 * @param {Array|import("ol/Feature.js").default} selected        [description]
	 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent [description]
	 */
	constructor(type, selected ,deselected, mapBrowserEvent) {
		super(type);
		this.selected  = selected;
		this.deselected = deselected;
		this.mapBrowserEvent = mapBrowserEvent;
	}
}
/**
 * @classdesc
 * @extends Interaction
 * @fires N2SelectEvent
 * @api
 */
class N2Select extends Interaction {
	constructor(opt_options){
		const options = opt_options ? opt_options: {};

		super({
			handleEvent: handleEvent_
		});
		this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 2;

		/**
	     * @private
	     * @type {boolean}
	     */
	    this.multi_ = options.multi ? options.multi : false;

		//clicked can return multiple ones.
		this.clickedFeatures_ = [];

		//hover can only hover one
		this.hoveredFeature_ = null;

		this.map_ = options.map ? options.map : null;
		this.setActive(true);
	}
	getHoveredFeatures() {
		return this.hoveredFeatures_;
	}

	getClickedFeatures(){
		return this.clickedFeatures_;
	}
	getHitTolerance() {
      return this.hitTolerance_;
    }

	setHitTolerance(hitTolerance) {
      this.hitTolerance_ = hitTolerance;
    }
	setActive(b){
		super.setActive(b)
		if (b &&
			this.map_) {
			super.setMap(this.map_)
			this.map_.addInteraction(this);
		} else {
			super.setMap();

		}
	}
}
  /**
   * [handleMove_ description]
   * @param  {import("../MapBrowserEvent.js").default} mapBrowserEvent [description]
   * @return {[type]}   [description]
   * @this {N2Select}
   */
   function handleEvent_(mapBrowserEvent) {

			const map = mapBrowserEvent.map;
			//** handle hover event **///
			//TODO make a list of n2.interaction, instead all take care by this interaction object.
			if (mapBrowserEvent.type == "pointermove") {
				let selected = null ;
				let deselected = null;

				map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
					(function(f){
						selected = f;
						return true;
					}).bind(this),
					{
						hitTolerance: this.hitTolerance_
					});

			    if ( this.hoveredFeature_ === selected ) {
					/* no hovered changed */
			    } else {
				deselected = this.hoveredFeature_;
				this.hoveredFeature_ = selected;
				this.dispatchEvent(
						new N2SelectEvent(N2SelectEventType.HOVER,
							selected || null, deselected, mapBrowserEvent)
						);
				}
			    
			} else if (mapBrowserEvent.type == 'click') {

				let selected = [];
				let deselected = [];
				map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
			      (
			        /**
			         * @param {import("../Feature.js").FeatureLike} feature Feature.
			         * @param {import("../layer/Layer.js").default} layer Layer.
			         * @return {boolean|undefined} Continue to iterate over the features.
			         */
			        function(feature, layer) {
			          if (feature) {
			            selected.push(feature);
			            return true;
			          }
			        }).bind(this), {
			        hitTolerance: this.hitTolerance_
			      });
			    for (let i = this.clickedFeatures_.length - 1; i >= 0; --i) {
			      const feature = this.clickedFeatures_[i];
			      const index = selected.indexOf(feature);
			      if (index > -1) {
			        // feature is already selected
			        selected.splice(index, 1);
			      } else {
			        this.clickedFeatures_.splice(i, 1);
			        deselected.push(feature);
			      }
			    }
			    if (selected.length !== 0) {
			      Array.prototype.push.apply(this.clickedFeatures_, selected);
			    }
				if (selected.length > 0 || deselected.length > 0) {
			      this.dispatchEvent(
			        new N2SelectEvent(N2SelectEventType.CLICKED,
			          selected, deselected, mapBrowserEvent));
			    }
			}
			//keep mapBrowserEvent propagating
			return true;
	}

	export default N2Select;
